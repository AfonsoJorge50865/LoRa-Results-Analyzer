#include "LoRaWan_APP.h"
#include "Arduino.h"
#include <Wire.h>               
#include "HT_SSD1306Wire.h"

static SSD1306Wire display(0x3c, 500000, SDA_OLED, SCL_OLED, GEOMETRY_128_64, RST_OLED);

#define RF_FREQUENCY 868000000
#define PACKETS_PER_CONFIG 15
#define SYNC_SF 12
#define SYNC_POWER 20
#define SYNC_PAYLOAD_LENGTH 20

struct LoRaConfig {
    int sf, pl, pe;
};

// Configurações otimizadas com inicializador compacto
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
int current_config = 0, packets_sent = 0;
uint32_t packet_counter = 0;
bool lora_idle = true, test_complete = false, sync_sent = false, sending_sync = false;
char *txpacket = nullptr, *sync_packet = nullptr;

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

void updateDisplay(const String& line1, const String& line2 = "", const String& line3 = "", const String& line4 = "", const String& line5 = "") {
    display.clear();
    if (line1.length()) display.drawString(0, 0, line1);
    if (line2.length()) display.drawString(0, 12, line2);
    if (line3.length()) display.drawString(0, 24, line3);
    if (line4.length()) display.drawString(0, 36, line4);
    if (line5.length()) display.drawString(0, 48, line5);
    display.display();
}

void OnTxDone(void) {
    if (sending_sync) {
        Serial.printf("Sync enviado para config %d\n", current_config + 1);
        updateDisplay("SYNC ENVIADO", "Config " + String(current_config + 1));
        delay(2000);
        configureRadio(false);
        sync_sent = true;
        sending_sync = false;
        lora_idle = true;
        return;
    }
    
    packets_sent++;
    if (packets_sent >= PACKETS_PER_CONFIG) {
        Serial.printf("Config %d completa! Aguardando...\n", current_config + 1);
        updateDisplay("Config " + String(current_config + 1) + " COMPLETA", "Aguardando 20 seg", "para próxima config...");
        delay(25000);
        
        current_config++;
        packets_sent = 0;
        sync_sent = false;
        
        if (current_config >= sizeof(configs)/sizeof(configs[0])) {
            test_complete = true;
            Serial.println("=== TESTE COMPLETO ===");
            updateDisplay("", "TESTE COMPLETO");
            return;
        }
        
        packet_counter = 0;
        configureRadio(true);
    }
    lora_idle = true;
}

void OnTxTimeout(void) {
    Radio.Sleep();
    Serial.println("TX Timeout");
    lora_idle = true;
}

void configureRadio(bool for_sync) {
    if (current_config >= sizeof(configs)/sizeof(configs[0])) return;
    
    LoRaConfig config = for_sync ? LoRaConfig{SYNC_SF, SYNC_PAYLOAD_LENGTH, SYNC_POWER} : configs[current_config];
    
    // Gerenciar buffers
    if (for_sync) {
        if (!sync_packet) sync_packet = (char*)malloc(SYNC_PAYLOAD_LENGTH + 1);
    } else {
        if (txpacket) free(txpacket);
        txpacket = (char*)malloc(config.pl + 1);
        
        Serial.printf("\n=== CONFIG %d/%d ===\nSF:%d PL:%d PE:%ddBm Pacotes:%d\n", 
                     current_config + 1, (int)(sizeof(configs)/sizeof(configs[0])), 
                     config.sf, config.pl, config.pe, PACKETS_PER_CONFIG);
    }
    
    Radio.Sleep();
    delay(10);
    Radio.Init(&RadioEvents);
    Radio.SetChannel(RF_FREQUENCY);
    Radio.SetTxConfig(MODEM_LORA, config.pe, 0, 0, config.sf, 1, 8, false, 0, 0, 0, false, 3000);
    Radio.Standby();
    lora_idle = true;
}

void sendSyncPacket() {
    sprintf(sync_packet, "SYNC%02d", current_config + 1);
    memset(sync_packet + 6, '0', SYNC_PAYLOAD_LENGTH - 6);
    sync_packet[SYNC_PAYLOAD_LENGTH] = '\0';
    
    Serial.printf("Enviando sync: %s (Config %d)\n", sync_packet, current_config + 1);
    updateDisplay("ENVIANDO SYNC", 
                  "Config " + String(current_config + 1) + "/" + String(sizeof(configs)/sizeof(configs[0])),
                  "SF:" + String(SYNC_SF) + " PE:" + String(SYNC_POWER) + "dBm",
                  "Pacote: " + String(sync_packet));
    
    sending_sync = true;
    Radio.Send((uint8_t *)sync_packet, SYNC_PAYLOAD_LENGTH);
}

void sendDataPacket() {
    LoRaConfig config = configs[current_config];
    
    char seq_str[4];
    sprintf(seq_str, "%03d", ++packet_counter);
    
    uint32_t checksum = calculate_checksum(seq_str, 3);
    sprintf(txpacket, "PKT%08lX", checksum);
    
    // Padding otimizado
    memset(txpacket + 11, '0', config.pl - 14);
    memcpy(txpacket + config.pl - 3, seq_str, 3);
    txpacket[config.pl] = '\0';
    
    Serial.printf("Config %d/%d - Pacote %d/%d: %s\n", 
                 current_config + 1, (int)(sizeof(configs)/sizeof(configs[0])),
                 packets_sent + 1, PACKETS_PER_CONFIG, txpacket);
    
    updateDisplay("Config " + String(current_config + 1) + "/" + String(sizeof(configs)/sizeof(configs[0])),
                  "SF:" + String(config.sf) + " PL:" + String(config.pl) + " PE:" + String(config.pe) + "dBm",
                  "",
                  "Pacotes: " + String(packets_sent + 1) + "/" + String(PACKETS_PER_CONFIG),
                  "Total: " + String(packet_counter));
    
    Radio.Send((uint8_t *)txpacket, config.pl);
}

void setup() {
    Serial.begin(115200);
    Mcu.begin(HELTEC_BOARD, SLOW_CLK_TPYE);
    
    RadioEvents.TxDone = OnTxDone;
    RadioEvents.TxTimeout = OnTxTimeout;
    
    VextON();
    display.init();
    display.setFont(ArialMT_Plain_10);
    display.setTextAlignment(TEXT_ALIGN_LEFT);
    
    Serial.println("Transmissor inicializado");
    configureRadio(true);
}

void loop() {
    if (test_complete) {
        delay(1000);
        return;
    }
    
    if (lora_idle && current_config < sizeof(configs)/sizeof(configs[0])) {
        if (!sync_sent) {
            delay(500);
            sendSyncPacket();
        } else {
            delay(1000);
            sendDataPacket();
        }
        lora_idle = false;
    }
    Radio.IrqProcess();
}