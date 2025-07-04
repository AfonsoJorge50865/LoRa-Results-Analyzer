import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Filter, Eye, EyeOff } from 'lucide-react';
import Papa from 'papaparse';

const LoRaAnalyzer = () => {
  // States for controlling filters and visualization
  const [selectedSF, setSelectedSF] = useState('all');
  const [selectedPE, setSelectedPE] = useState('all');
  const [selectedPL, setSelectedPL] = useState('all');
  const [activeChart, setActiveChart] = useState('rssi');
  const [visibleConfigs, setVisibleConfigs] = useState(new Set());
  const [dataType, setDataType] = useState('nlos');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize empty data states
  const [rawDataNLOS, setRawDataNLOS] = useState([]);
  const [rawDataLOS, setRawDataLOS] = useState([]);

  // Load CSV data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load NLOS data
        const nlosResponse = await fetch('Resultados_NLOS.csv');
        const nlosText = await nlosResponse.text();
        const nlosData = parseCSV(nlosText);
        setRawDataNLOS(nlosData);

        // Load LOS data
        const losResponse = await fetch('Resultados_LOS.csv');
        const losText = await losResponse.text();
        const losData = parseCSV(losText);
        setRawDataLOS(losData);
      } catch (error) {
        console.error('Error loading CSV files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // CSV parsing function
  const parseCSV = (csvText) => {
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    return results.data
      .filter(row => row['Distance (m)'] && row['Config ID'])
      .map(row => ({
        distance: parseInt(row['Distance (m)']),
        configId: parseInt(row['Config ID']),
        sf: parseInt(row['SF']),
        pl: parseInt(row['PL (bytes)']),
        pe: parseInt(row['PE (dBm)']),
        recebidos: parseInt(row['Recebidos']),
        corruptos: parseInt(row['Corruptos'] || 0),
        perdidos: parseInt(row['Perdidos'] || 0),
        rssi: row['RSSI (dBm)'] === 'NA' ? null : parseFloat(row['RSSI (dBm)'].replace(',', '.')),
        snr: row['SNR (dB)'] === 'NA' ? null : parseFloat(row['SNR (dB)'].replace(',', '.'))
      }));
  };

  const activeRawData = dataType === 'nlos' ? rawDataNLOS : rawDataLOS;

  // Process data for charts
  const processedData = useMemo(() => {
    if (isLoading || activeRawData.length === 0) return [];

    // Filter data based on selected criteria
    let filteredData = activeRawData.filter(item => {
      if (selectedSF !== 'all' && item.sf !== parseInt(selectedSF)) return false;
      if (selectedPE !== 'all' && item.pe !== parseInt(selectedPE)) return false;
      if (selectedPL !== 'all' && item.pl !== parseInt(selectedPL)) return false;
      return true;
    });

    // Group by distance
    const groupedByDistance = {};
    filteredData.forEach(item => {
      if (!groupedByDistance[item.distance]) {
        groupedByDistance[item.distance] = { distance: item.distance };
      }
      
      const configKey = `SF${item.sf} PL${item.pl} PE${item.pe}`;
      
      if (activeChart === 'rssi') {
        groupedByDistance[item.distance][configKey] = item.rssi;
      } else if (activeChart === 'snr') {
        groupedByDistance[item.distance][configKey] = item.snr;
      } else if (activeChart === 'success_rate') {
        const successRate = (item.recebidos / 15) * 100;
        groupedByDistance[item.distance][configKey] = successRate;
      }
    });

    return Object.values(groupedByDistance).sort((a, b) => a.distance - b.distance);
  }, [activeRawData, selectedSF, selectedPE, selectedPL, activeChart, isLoading]);

  // Get unique configurations for legend
  const uniqueConfigs = useMemo(() => {
    if (isLoading || activeRawData.length === 0) return [];
    
    const configs = new Set();
    activeRawData.forEach(item => {
      if (selectedSF === 'all' || item.sf === parseInt(selectedSF)) {
        if (selectedPE === 'all' || item.pe === parseInt(selectedPE)) {
          if (selectedPL === 'all' || item.pl === parseInt(selectedPL)) {
            configs.add(`SF${item.sf} PL${item.pl} PE${item.pe}`);
          }
        }
      }
    });
    return Array.from(configs);
  }, [activeRawData, selectedSF, selectedPE, selectedPL, isLoading]);

  // Improved color scheme
  const colors = [
    '#3366cc', '#dc3912', '#ff9900', '#109618', '#990099',
    '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395',
    '#994499', '#22aa99', '#aaaa11', '#6633cc', '#e67300'
  ];

  // Toggle configuration visibility
  const toggleConfigVisibility = (config) => {
    const newVisible = new Set(visibleConfigs);
    if (newVisible.has(config)) {
      newVisible.delete(config);
    } else {
      newVisible.add(config);
    }
    setVisibleConfigs(newVisible);
  };

  // Show or hide all configurations
  const showAllConfigs = () => setVisibleConfigs(new Set(uniqueConfigs));
  const hideAllConfigs = () => setVisibleConfigs(new Set());

  return (
  <div className="lora-container">
    <div className="analyzer-card">
      <h1 className="main-title">Análise LoRa Performance - {dataType === 'nlos' ? 'NLOS' : 'LOS'}</h1>
      
      {/* Filtros */}
      <div className="filter-section">
        <div className="flex-center">
          <Filter className="icon" />
          <h2 className="section-title">Filtros</h2>
        </div>
        
        <div className="filter-grid">
          {/* Seletor de tipo de ambiente */}
          <div>
            <label className="label">Tipo de Ambiente</label>
            <select 
              value={dataType} 
              onChange={(e) => setDataType(e.target.value)}
              className="filter-control"
            >
              <option value="nlos">NLOS (Non-Line-of-Sight)</option>
              <option value="los">LOS (Line-of-Sight)</option>
            </select>
          </div>
          
          <div>
            <label className="label">Spreading Factor</label>
            <select 
              value={selectedSF} 
              onChange={(e) => setSelectedSF(e.target.value)}
              className="filter-control"
            >
              <option value="all">Todos</option>
              <option value="7">SF 7</option>
              <option value="9">SF 9</option>
              <option value="12">SF 12</option>
            </select>
          </div>
          
          <div>
            <label className="label">Power Emission (dBm)</label>
            <select 
              value={selectedPE} 
              onChange={(e) => setSelectedPE(e.target.value)}
              className="filter-control"
            >
              <option value="all">Todos</option>
              <option value="7">7 dBm</option>
              <option value="10">10 dBm</option>
              <option value="14">14 dBm</option>
            </select>
          </div>
          
          <div>
            <label className="label">Payload (bytes)</label>
            <select 
              value={selectedPL} 
              onChange={(e) => setSelectedPL(e.target.value)}
              className="filter-control"
            >
              <option value="all">Todos</option>
              <option value="30">30 bytes</option>
              <option value="70">70 bytes</option>
              <option value="110">110 bytes</option>
            </select>
          </div>
          
          <div>
            <label className="label">Métrica</label>
            <select 
              value={activeChart} 
              onChange={(e) => setActiveChart(e.target.value)}
              className="filter-control"
            >
              <option value="rssi">RSSI (dBm)</option>
              <option value="snr">SNR (dB)</option>
              <option value="success_rate">Taxa de Sucesso (%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="chart-wrapper" style={{ height: '500px' }}>
        <div className="chart-header">
          <h3 className="chart-title">
            {activeChart === 'rssi' ? 'RSSI vs Distância' :
            activeChart === 'snr' ? 'SNR vs Distância' : 
            'Taxa de Sucesso vs Distância'}
          </h3>
          
          <div className="chart-legend">
            {uniqueConfigs.map((config, index) => (
              visibleConfigs.has(config) && (
                <div key={config} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="legend-label">{config}</span>
                </div>
              )
            ))}
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="distance"
              label={{ value: 'Distância (m)', position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              label={{
                value: activeChart === 'rssi' ? 'RSSI (dBm)' : 
                      activeChart === 'snr' ? 'SNR (dB)' : 'Taxa de Sucesso (%)',
                angle: -90,
                position: 'insideLeft'
              }}
            />
            <Tooltip
              formatter={(value, name) => [
                value !== null ? value.toFixed(2) : 'N/A',
                name
              ]}
              labelFormatter={(label) => `Distância: ${label}m`}
            />
            
            {uniqueConfigs.map((config, index) => (
              visibleConfigs.has(config) && (
                <Line
                  key={config}
                  type="monotone"
                  dataKey={config}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Controles de visibilidade */}
      <div className="visibility-controls">
        <div className="visibility-header">
          <h3 className="section-title">Configurações Visíveis</h3>
          <div className="visibility-buttons">
            <button 
              onClick={showAllConfigs}
              className="button button-show-all"
            >
              Mostrar Todas
            </button>
            <button 
              onClick={hideAllConfigs}
              className="button button-hide-all"
            >
              Esconder Todas
            </button>
          </div>
        </div>
        
        <div className="visibility-grid">
          {uniqueConfigs.map((config, index) => (
            <button
              key={config}
              onClick={() => toggleConfigVisibility(config)}
              className={`config-button ${visibleConfigs.has(config) ? 'active' : ''}`}
            >
              {visibleConfigs.has(config) ? <Eye className="icon" /> : <EyeOff className="icon" />}
              <div 
                className="color-indicator" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span>{config}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

    <style jsx>{`
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .chart-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        max-width: 60%;
        font-family: inherit;
      }
      
      .legend-item {
        display: flex;
        align-items: center;
        margin-right: 10px;
      }
      
      .legend-color {
        width: 14px;
        height: 14px;
        margin-right: 8px;
        border-radius: 3px;
      }
      
      .legend-label {
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        color: #333;
        font-family: inherit;
      }
      
      .chart-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }
      
      @media (max-width: 768px) {
        .chart-header {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .chart-legend {
          max-width: 100%;
          margin-top: 10px;
          gap: 8px;
        }
        
        .legend-label {
          font-size: 13px;
        }
      }
    `}</style>
  </div>
);
};

export default LoRaAnalyzer;