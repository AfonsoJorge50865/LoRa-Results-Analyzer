#include "LoRaWan_APP.h"
#include "Arduino.h"
#include <Wire.h>               
#include "HT_SSD1306Wire.h"

static SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_128_64, RST_OLED);

#define RF_FREQUENCY 868000000
#define PACKETS_PER_CONFIG 15
#define NO_PACKET_TIMEOUT_MS 20000
#define NO_PACKET_TIMEOUT_MS_EXTENDED 60000
#define SYNC_SF 12
#define SYNC_POWER 20
#define SYNC_PAYLOAD_LENGTH 20

struct LoRaConfig {
    int sf, pl, pe;
};

struct ConfigStats {
    uint32_t total_received, total_corrupt, total_lost;
    double rssi, snr;
};

// Configurações otimizadas
LoRaConfig configs[] = {
    // SF=7 com diferentes PL e PE
    {7,30,7}, {7,30,10}, {7,30,14}, 
    {7,70,7}, {7,70,10}, {7,70,14}, 
    {7,110,7}, {7,110,10}, {7,110,14},
    // SF=9 com diferentes PL e PE  
    {9,30,7}, {9,30,10}, {9,30,14}, 
    {9,70,7}, {9,70,10}, {9,70,14}, 
    {9,110,7}, {9,110,10}, {9,110,14},
    // SF=12 com diferentes PL e PE
    {12,30,7}, {12,30,10}, {12,30,14}, 
    {12,70,7}, {12,70,10}, {12,70,14}, 
    {12,110,7}, {12,110,10}, {12,110,14}
};

// Variáveis globais otimizadas
int current_config = 0;
bool lora_idle = true, test_complete = false, waiting_for_sync = true;
char *rxpacket = nullptr, *sync_packet = nullptr;
int16_t rssi = 0, rxSize = 0;
unsigned long last_packet_time = 0;

ConfigStats config_stats[27];
ConfigStats *current_stats;

static RadioEvents_t RadioEvents;

// Hash FNV-1a 32-bit otimizada
uint32_t calculate_checksum(const char *data, size_t len) {
    uint32_t hash = 0x811C9DC5;
    for(size_t i = 0; i < len; i++) {
        hash = (hash ^ data[i]) * 0x01000193;
    }
    return hash;
}

void VextON(void) {
    pinMode(Vext, OUTPUT);
    digitalWrite(Vext, LOW);
}

void updateDisplay(const String& l1, const String& l2 = "", const String& l3 = "", const String& l4 = "", const String& l5 = "") {
    display.clear();
    if (l1.length()) display.drawString(0, 0, l1);
    if (l2.length()) display.drawString(0, 12, l2);
    if (l3.length()) display.drawString(0, 24, l3);
    if (l4.length()) display.drawString(0, 36, l4);
    if (l5.length()) display.drawString(0, 48, l5);
    display.display();
}

void initConfigStats() {
    memset(config_stats, 0, sizeof(config_stats));
}

void showConfigResultsWhileWaitingSync(int idx) {
    LoRaConfig config = configs[idx];
    ConfigStats stats = config_stats[idx];
    
    uint32_t total_processed = stats.total_received + stats.total_corrupt;
    stats.total_lost = (PACKETS_PER_CONFIG > total_processed) ? (PACKETS_PER_CONFIG - total_processed) : 0;
    float per = (100.0 * (stats.total_lost + stats.total_corrupt) / PACKETS_PER_CONFIG);

    double avg_rssi_mw = stats.rssi / (double)stats.total_received;
    double avg_rssi_dbm = 10.0 * log10(avg_rssi_mw);
    double avg_snr_w = stats.snr / (double)stats.total_received;
    double avg_snr_db = 10.0 * log10(avg_snr_w);

    
    Serial.printf("\n=== RESULTADOS CONFIG %d ===\n", idx + 1);
    Serial.printf("SF:%d PL:%d PE:%ddBm\n", config.sf, config.pl, config.pe);
    Serial.printf("Recebidos:%d Corruptos:%d Perdidos:%d\n", 
                  stats.total_received, stats.total_corrupt, stats.total_lost);
    Serial.printf("PER:%.2f%%\n", per);
    Serial.println("========================\n");
    
    // Display mostra resultados enquanto aguarda próximo sync
    updateDisplay("RESULTADO CONFIG " + String(idx + 1),
                  "SF:" + String(config.sf) + " PL:" + String(config.pl) + " PE:" + String(config.pe),
                  "Rec:" + String(stats.total_received) + " Corr:" + String(stats.total_corrupt) + " Perd:" + String(stats.total_lost),
                  "PER: " + String(per, 1) + "%",
                  "RSSI:" + String(avg_rssi_dbm, 2) + " SNR:" + String(avg_snr_db, 2));
}

void finishCurrentConfig(const char* reason) {
    Serial.printf("Finalizando config %d - %s\n", current_config + 1, reason);
    
    Radio.Sleep();
    
    // Salvar config atual antes de incrementar
    int completed_config = current_config;
    
    // Incrementar para próxima config
    current_config++;
    last_packet_time = 0;
    
    if (current_config >= sizeof(configs)/sizeof(configs[0])) {
        test_complete = true;
        Serial.println("=== TODAS AS CONFIGURAÇÕES COMPLETADAS ===");
        return;
    }
    
    // Passar imediatamente para aguardar sync da próxima config
    waiting_for_sync = true;
    configureRadioForSync();
    
    // Mostrar resultados da config completada enquanto aguarda sync
    showConfigResultsWhileWaitingSync(completed_config);
}

void configureRadioForSync() {
    if (current_config >= sizeof(configs)/sizeof(configs[0])) {
        test_complete = true;
        return;
    }
    
    // Gerenciar buffer de sync
    if (!sync_packet) sync_packet = (char*)malloc(SYNC_PAYLOAD_LENGTH + 1);
    
    Serial.printf("Aguardando sync para config %d...\n", current_config + 1);
    
    Radio.Sleep();
    Radio.SetRxConfig(MODEM_LORA, 0, SYNC_SF, 1, 0, 8, 0, false, SYNC_PAYLOAD_LENGTH, 0, 0, 0, false, true);
    lora_idle = true;
}

void configureRadioForData() {
    if (current_config >= sizeof(configs)/sizeof(configs[0])) {
        test_complete = true;
        return;
    }
    
    LoRaConfig config = configs[current_config];
    
    // Gerenciar buffer de dados
    if (rxpacket) free(rxpacket);
    rxpacket = (char*)malloc(config.pl + 1);
    current_stats = &config_stats[current_config];
    
    Serial.printf("\n=== CONFIG %d/%d ===\nSF:%d PL:%d PE:%d Timeout:%dms\n", 
                 current_config + 1, (int)(sizeof(configs)/sizeof(configs[0])), 
                 config.sf, config.pl, config.pe, NO_PACKET_TIMEOUT_MS);
    
    updateDisplay("Config " + String(current_config + 1) + "/" + String(sizeof(configs)/sizeof(configs[0])),
                  "SF:" + String(config.sf) + " PL:" + String(config.pl) + " PE:" + String(config.pe),
                  "Aguardando pacotes...");
    
    last_packet_time = millis();
    waiting_for_sync = false;
    
    Radio.Sleep();
    Radio.SetRxConfig(MODEM_LORA, 0, config.sf, 1, 0, 8, 0, false, config.pl, 0, 0, 0, false, true);
    lora_idle = true;
}

void OnRxDone(uint8_t *payload, uint16_t size, int16_t rssi_val, int8_t snr) {
    if (test_complete) return;
    
    rssi = rssi_val;
    rxSize = size;
    
    if (waiting_for_sync) {
        memcpy(sync_packet, payload, size);
        sync_packet[size] = '\0';
        
        Serial.printf("Sync recebido: %s (RSSI:%d SNR:%d)\n", sync_packet, rssi, snr);
        
        if (size == SYNC_PAYLOAD_LENGTH && strncmp(sync_packet, "SYNC", 4) == 0) {
            char config_str[3];
            memcpy(config_str, sync_packet + 4, 2);
            config_str[2] = '\0';
            int sync_config = atoi(config_str);
            
            if (sync_config == current_config + 1) {
                Serial.println("Sincronização válida! Iniciando teste...");
                configureRadioForData();
                return;
            } else {
                Serial.printf("Sync inválida. Esperado:%d Recebido:%d\n", current_config + 1, sync_config);
            }
        }
        
        Radio.Sleep();
        lora_idle = true;
        return;
    }
    
    last_packet_time = millis();
    memcpy(rxpacket, payload, size);
    rxpacket[size] = '\0';
    
    LoRaConfig config = configs[current_config];
    Serial.printf("Recebido: %s (RSSI:%d SNR:%d Len:%d)\n", rxpacket, rssi, snr, rxSize);
    
    bool valid_packet = false;
    uint32_t received_sequence = 0;
    
    if(size == config.pl && strncmp(rxpacket, "PKT", 3) == 0) {
        char checksum_str[9], seq_str[4];
        memcpy(checksum_str, rxpacket + 3, 8);
        checksum_str[8] = '\0';
        uint32_t received_checksum = strtoul(checksum_str, NULL, 16);
        
        memcpy(seq_str, rxpacket + (config.pl - 3), 3);
        seq_str[3] = '\0';
        received_sequence = atoi(seq_str);
        
        if(calculate_checksum(seq_str, 3) == received_checksum) {
            valid_packet = true;

            current_stats->rssi += pow(10.0, (double)rssi /10.0);
            current_stats->snr += pow(10.0, (double)snr /10.0);
            
            if (received_sequence == PACKETS_PER_CONFIG) {
                Serial.printf("Pacote #%d recebido! Finalizando...\n", PACKETS_PER_CONFIG);
                current_stats->total_received++;
                finishCurrentConfig("Pacote 15 recebido");
                return;
            }
        }
    }
    
    if(valid_packet) {
        current_stats->total_received++;
    } else {
        current_stats->total_corrupt++;
    }
    
    uint32_t total_processed = current_stats->total_received + current_stats->total_corrupt;
    uint32_t current_lost = (PACKETS_PER_CONFIG > total_processed) ? (PACKETS_PER_CONFIG - total_processed) : 0;
    float per = (100.0 * (current_lost + current_stats->total_corrupt) / PACKETS_PER_CONFIG);
    
    Serial.printf("Config %d Stats - Rec:%d Corr:%d Perd:%d PER:%.2f%%\n",
                 current_config + 1, current_stats->total_received, 
                 current_stats->total_corrupt, current_lost, per);
    
    updateDisplay("Config " + String(current_config + 1) + "/" + String(sizeof(configs)/sizeof(configs[0])),
                  "SF:" + String(config.sf) + " PL:" + String(config.pl) + " PE:" + String(config.pe),
                  "PKT#" + String(received_sequence) + " RSSI:" + String(rssi) + " SNR:" + String(snr),
                  "Rec:" + String(current_stats->total_received) + " Corr:" + String(current_stats->total_corrupt) + " Perd:" + String(current_lost),
                  "PER:" + String(per, 1) + "%");
    
    Radio.Sleep();
    lora_idle = true;
}

void OnRxTimeout(void) {
    Radio.Sleep();
    lora_idle = true;
}

void setup() {
    Serial.begin(115200);
    Mcu.begin(HELTEC_BOARD, SLOW_CLK_TPYE);
    
    RadioEvents.RxDone = OnRxDone;
    RadioEvents.RxTimeout = OnRxTimeout;
    Radio.Init(&RadioEvents);
    Radio.SetChannel(RF_FREQUENCY);
    
    VextON();
    display.init();
    display.setFont(ArialMT_Plain_10);
    display.setTextAlignment(TEXT_ALIGN_LEFT);
    
    initConfigStats();
    configureRadioForSync();
    
    Serial.println("Receiver inicializado. Aguardando sincronização...");
}

void loop() {
    if (test_complete) {
        updateDisplay("TESTE COMPLETO", "Todas as configs", "foram testadas!", 
                      "Ver Serial para", "resumo completo");
        delay(5000);
        return;
    }
    
    // Verificar timeout apenas se não estiver esperando sync
    if (!waiting_for_sync) {
        unsigned long current_time = millis();
        unsigned long timeout = (current_config > 16) ? NO_PACKET_TIMEOUT_MS_EXTENDED : NO_PACKET_TIMEOUT_MS;
        if(current_time - last_packet_time >= timeout) {
            Serial.printf("Timeout de %d seg! Finalizando...\n", timeout / 1000);
            finishCurrentConfig("Timeout de 20 segundos");
            return;
        }
    }
    
    if(lora_idle && !test_complete) {
        lora_idle = false;
        Radio.Rx(0);
    }
    Radio.IrqProcess();
}