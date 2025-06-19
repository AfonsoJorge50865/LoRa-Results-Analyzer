import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Filter, Eye, EyeOff } from 'lucide-react';

const LoRaAnalyzer = () => {
  // Dados processados do CSV
  const rawDataNLOS = [
  // SF=7 configurations
  {distance: 30, configId: 1, sf: 7, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -84.57, snr: 11.82},
  {distance: 80, configId: 1, sf: 7, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -84.57, snr: 2.2},
  {distance: 150, configId: 1, sf: 7, pl: 30, pe: 7, recebidos: 5, corruptos: 1, perdidos: 9, rssi: -112.57, snr: -6.19},
  {distance: 225, configId: 1, sf: 7, pl: 30, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 300, configId: 1, sf: 7, pl: 30, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 2, sf: 7, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -79.94, snr: 11.94},
  {distance: 80, configId: 2, sf: 7, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -106.1, snr: 6.1},
  {distance: 150, configId: 2, sf: 7, pl: 30, pe: 10, recebidos: 12, corruptos: 0, perdidos: 3, rssi: -112.11, snr: -5.14},
  {distance: 225, configId: 2, sf: 7, pl: 30, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 300, configId: 2, sf: 7, pl: 30, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 3, sf: 7, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -77.93, snr: 11.82},
  {distance: 80, configId: 3, sf: 7, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.06, snr: 6.58},
  {distance: 150, configId: 3, sf: 7, pl: 30, pe: 14, recebidos: 9, corruptos: 1, perdidos: 5, rssi: -112.12, snr: -5.16},
  {distance: 225, configId: 3, sf: 7, pl: 30, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 300, configId: 3, sf: 7, pl: 30, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 4, sf: 7, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -83.37, snr: 11.73},
  {distance: 80, configId: 4, sf: 7, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -108.39, snr: 3.61},
  {distance: 150, configId: 4, sf: 7, pl: 70, pe: 7, recebidos: 13, corruptos: 0, perdidos: 2, rssi: -112.15, snr: -6.96},
  {distance: 225, configId: 4, sf: 7, pl: 70, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 300, configId: 4, sf: 7, pl: 70, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 5, sf: 7, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -83.09, snr: 11.94},
  {distance: 80, configId: 5, sf: 7, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.99, snr: 6.01},
  {distance: 150, configId: 5, sf: 7, pl: 70, pe: 10, recebidos: 11, corruptos: 1, perdidos: 3, rssi: -112.18, snr: -4.46},
  {distance: 225, configId: 5, sf: 7, pl: 70, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 300, configId: 5, sf: 7, pl: 70, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 6, sf: 7, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -75.69, snr: 12},
  {distance: 80, configId: 6, sf: 7, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -103.61, snr: 7.57},
  {distance: 150, configId: 6, sf: 7, pl: 70, pe: 14, recebidos: 7, corruptos: 2, perdidos: 6, rssi: -112.54, snr: -6.65},
  {distance: 225, configId: 6, sf: 7, pl: 70, pe: 14, recebidos: 5, corruptos: 3, perdidos: 7, rssi: -113.57, snr: -8.95},
  {distance: 300, configId: 6, sf: 7, pl: 70, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 7, sf: 7, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -80.72, snr: 12.29},
  {distance: 80, configId: 7, sf: 7, pl: 110, pe: 7, recebidos: 14, corruptos: 0, perdidos: 1, rssi: -108.81, snr: 3.44},
  {distance: 150, configId: 7, sf: 7, pl: 110, pe: 7, recebidos: 7, corruptos: 0, perdidos: 8, rssi: -112.4, snr: 6.46},
  {distance: 225, configId: 7, sf: 7, pl: 110, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 300, configId: 7, sf: 7, pl: 110, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 8, sf: 7, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -77.37, snr: 12.29},
  {distance: 80, configId: 8, sf: 7, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.59, snr: 6.43},
  {distance: 150, configId: 8, sf: 7, pl: 110, pe: 10, recebidos: 9, corruptos: 2, perdidos: 4, rssi: -112.42, snr: -6.83},
  {distance: 225, configId: 8, sf: 7, pl: 110, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 300, configId: 8, sf: 7, pl: 110, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 9, sf: 7, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -75.42, snr: 12.07},
  {distance: 80, configId: 9, sf: 7, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -101.67, snr: 8.96},
  {distance: 150, configId: 9, sf: 7, pl: 110, pe: 14, recebidos: 12, corruptos: 0, perdidos: 3, rssi: -111.39, snr: -3.11},
  {distance: 225, configId: 9, sf: 7, pl: 110, pe: 14, recebidos: 0, corruptos: 1, perdidos: 14, rssi: null, snr: null},
  {distance: 300, configId: 9, sf: 7, pl: 110, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  // SF=9 configurations
  {distance: 30, configId: 10, sf: 9, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -81.02, snr: 10.36},
  {distance: 80, configId: 10, sf: 9, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -107.42, snr: 4.58},
  {distance: 150, configId: 10, sf: 9, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -112.26, snr: -5.81},
  {distance: 225, configId: 10, sf: 9, pl: 30, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 300, configId: 10, sf: 9, pl: 30, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 11, sf: 9, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -79.24, snr: 10.36},
  {distance: 80, configId: 11, sf: 9, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -103.33, snr: 7.43},
  {distance: 150, configId: 11, sf: 9, pl: 30, pe: 10, recebidos: 7, corruptos: 4, perdidos: 4, rssi: -112.69, snr: -8.78},
  {distance: 225, configId: 11, sf: 9, pl: 30, pe: 10, recebidos: 2, corruptos: 2, perdidos: 11, rssi: -113.47, snr: -13.47},
  {distance: 300, configId: 11, sf: 9, pl: 30, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 12, sf: 9, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -77.03, snr: 10.76},
  {distance: 80, configId: 12, sf: 9, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -102.59, snr: 7.97},
  {distance: 150, configId: 12, sf: 9, pl: 30, pe: 14, recebidos: 14, corruptos: 1, perdidos: 0, rssi: -110.11, snr: -0.39},
  {distance: 225, configId: 12, sf: 9, pl: 30, pe: 14, recebidos: 13, corruptos: 0, perdidos: 2, rssi: -114.07, snr: -13.44},
  {distance: 300, configId: 12, sf: 9, pl: 30, pe: 14, recebidos: 0, corruptos: 3, perdidos: 12, rssi: null, snr: null},

  {distance: 30, configId: 13, sf: 9, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -84.98, snr: 9.87},
  {distance: 80, configId: 13, sf: 9, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -107.22, snr: 4.71},
  {distance: 150, configId: 13, sf: 9, pl: 70, pe: 7, recebidos: 10, corruptos: 0, perdidos: 5, rssi: -112.89, snr: -9.81},
  {distance: 225, configId: 13, sf: 9, pl: 70, pe: 7, recebidos: 0, corruptos: 1, perdidos: 14, rssi: null, snr: null},
  {distance: 300, configId: 13, sf: 9, pl: 70, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 14, sf: 9, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -80.53, snr: 10.22},
  {distance: 80, configId: 14, sf: 9, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -104.59, snr: 6.77},
  {distance: 150, configId: 14, sf: 9, pl: 70, pe: 10, recebidos: 10, corruptos: 2, perdidos: 3, rssi: -112.57, snr: -7.03},
  {distance: 225, configId: 14, sf: 9, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -113.93, snr: -13.03},
  {distance: 300, configId: 14, sf: 9, pl: 70, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 15, sf: 9, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -74.44, snr: 10.56},
  {distance: 80, configId: 15, sf: 9, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -102.17, snr: 8},
  {distance: 150, configId: 15, sf: 9, pl: 70, pe: 14, recebidos: 14, corruptos: 0, perdidos: 1, rssi: -109.98, snr: -1.04},
  {distance: 225, configId: 15, sf: 9, pl: 70, pe: 14, recebidos: 14, corruptos: 0, perdidos: 1, rssi: -114, snr: -10.97},
  {distance: 300, configId: 15, sf: 9, pl: 70, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 16, sf: 9, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -82.81, snr: 10.16},
  {distance: 80, configId: 16, sf: 9, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -107.58, snr: 4.42},
  {distance: 150, configId: 16, sf: 9, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -112.57, snr: -7.39},
  {distance: 225, configId: 16, sf: 9, pl: 110, pe: 7, recebidos: 3, corruptos: 3, perdidos: 9, rssi: -114, snr: -15},
  {distance: 300, configId: 16, sf: 9, pl: 110, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 17, sf: 9, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -78.8, snr: 10.43},
  {distance: 80, configId: 17, sf: 9, pl: 110, pe: 10, recebidos: 14, corruptos: 1, perdidos: 0, rssi: -105.58, snr: 6.17},
  {distance: 150, configId: 17, sf: 9, pl: 110, pe: 10, recebidos: 13, corruptos: 1, perdidos: 1, rssi: -112.75, snr: -7.88},
  {distance: 225, configId: 17, sf: 9, pl: 110, pe: 10, recebidos: 14, corruptos: 0, perdidos: 1, rssi: -114, snr: -13.26},
  {distance: 300, configId: 17, sf: 9, pl: 110, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 18, sf: 9, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -75.44, snr: 10.63},
  {distance: 80, configId: 18, sf: 9, pl: 110, pe: 14, recebidos: 14, corruptos: 1, perdidos: 0, rssi: -103.4, snr: 7.2},
  {distance: 150, configId: 18, sf: 9, pl: 110, pe: 14, recebidos: 12, corruptos: 3, perdidos: 0, rssi: -112.82, snr: -8.71},
  {distance: 225, configId: 18, sf: 9, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -113.93, snr: -11.03},
  {distance: 300, configId: 18, sf: 9, pl: 110, pe: 14, recebidos: 0, corruptos: 1, perdidos: 14, rssi: null, snr: null},

  // SF=12 configurations
  {distance: 30, configId: 19, sf: 12, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -80.75, snr: 4.76},
  {distance: 80, configId: 19, sf: 12, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -107.25, snr: 3.36},
  {distance: 150, configId: 19, sf: 12, pl: 30, pe: 7, recebidos: 13, corruptos: 1, perdidos: 1, rssi: -112.41, snr: -5.62},
  {distance: 225, configId: 19, sf: 12, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -114.06, snr: -14.8},
  {distance: 300, configId: 19, sf: 12, pl: 30, pe: 7, recebidos: 2, corruptos: 0, perdidos: 13, rssi: -115, snr: -22},

  {distance: 30, configId: 20, sf: 12, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -82.17, snr: 6.09},
  {distance: 80, configId: 20, sf: 12, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.51, snr: 3.74},
  {distance: 150, configId: 20, sf: 12, pl: 30, pe: 10, recebidos: 14, corruptos: 1, perdidos: 0, rssi: -112.31, snr: -5.23},
  {distance: 225, configId: 20, sf: 12, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -113.72, snr: -13.17},
  {distance: 300, configId: 20, sf: 12, pl: 30, pe: 10, recebidos: 5, corruptos: 1, perdidos: 9, rssi: -114, snr: -20.03},

  {distance: 30, configId: 21, sf: 12, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -76.58, snr: 5.64},
  {distance: 80, configId: 21, sf: 12, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -102.33, snr: 4.34},
  {distance: 150, configId: 21, sf: 12, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -111.32, snr: -2.5},
  {distance: 225, configId: 21, sf: 12, pl: 30, pe: 14, recebidos: 14, corruptos: 1, perdidos: 0, rssi: -114, snr: -10.55},
  {distance: 300, configId: 21, sf: 12, pl: 30, pe: 14, recebidos: 14, corruptos: 1, perdidos: 0, rssi: -113.84, snr: -17.93},

  {distance: 30, configId: 22, sf: 12, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -86.42, snr: 4.72},
  {distance: 80, configId: 22, sf: 12, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.66, snr: 3.46},
  {distance: 150, configId: 22, sf: 12, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -111.95, snr: -5.14},
  {distance: 225, configId: 22, sf: 12, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -113.98, snr: -15.39},
  {distance: 300, configId: 22, sf: 12, pl: 70, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 23, sf: 12, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -83.32, snr: 6.3},
  {distance: 80, configId: 23, sf: 12, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -104, snr: 4.44},
  {distance: 150, configId: 23, sf: 12, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -111.94, snr: -4.23},
  {distance: 225, configId: 23, sf: 12, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -113.98, snr: -12.47},
  {distance: 300, configId: 23, sf: 12, pl: 70, pe: 10, recebidos: 3, corruptos: 5, perdidos: 7, rssi: -114.64, snr: -21.92},

  {distance: 30, configId: 24, sf: 12, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -79.01, snr: 4.52},
  {distance: 80, configId: 24, sf: 12, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -101.54, snr: 4.49},
  {distance: 150, configId: 24, sf: 12, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -111.47, snr: -4.47},
  {distance: 225, configId: 24, sf: 12, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -113.71, snr: -12.07},
  {distance: 300, configId: 24, sf: 12, pl: 70, pe: 14, recebidos: 6, corruptos: 5, perdidos: 4, rssi: -114.82, snr: -21.39},

  {distance: 30, configId: 25, sf: 12, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -85.53, snr: 4.91},
  {distance: 80, configId: 25, sf: 12, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -108.69, snr: 2.53},
  {distance: 150, configId: 25, sf: 12, pl: 110, pe: 7, recebidos: 11, corruptos: 3, perdidos: 1, rssi: -112.7, snr: -7.05},
  {distance: 225, configId: 25, sf: 12, pl: 110, pe: 7, recebidos: 14, corruptos: 1, perdidos: 0, rssi: -113.92, snr: -15.67},
  {distance: 300, configId: 25, sf: 12, pl: 110, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 26, sf: 12, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -80.66, snr: 6.26},
  {distance: 80, configId: 26, sf: 12, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.37, snr: 4.23},
  {distance: 150, configId: 26, sf: 12, pl: 110, pe: 10, recebidos: 14, corruptos: 1, perdidos: 0, rssi: -112.21, snr: -6.44},
  {distance: 225, configId: 26, sf: 12, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -114, snr: -13.55},
  {distance: 300, configId: 26, sf: 12, pl: 110, pe: 10, recebidos: 0, corruptos: 1, perdidos: 14, rssi: null, snr: null},

  {distance: 30, configId: 27, sf: 12, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -82.12, snr: 6.07},
  {distance: 80, configId: 27, sf: 12, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -101.27, snr: 4.66},
  {distance: 150, configId: 27, sf: 12, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -109.72, snr: -2.78},
  {distance: 225, configId: 27, sf: 12, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -113.92, snr: -11.77},
  {distance: 300, configId: 27, sf: 12, pl: 110, pe: 14, recebidos: 1, corruptos: 3, perdidos: 11, rssi: -115, snr: -24}
];

  const rawDataLOS = [
  // SF=7 configurations (1-9)
  {distance: 30, configId: 1, sf: 7, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.81, snr: 2.2},
  {distance: 80, configId: 1, sf: 7, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.42, snr: 5.22},
  {distance: 150, configId: 1, sf: 7, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -110.63, snr: -3.09},
  {distance: 300, configId: 1, sf: 7, pl: 30, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 1, sf: 7, pl: 30, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 2, sf: 7, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -103.78, snr: 5.09},
  {distance: 80, configId: 2, sf: 7, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -106.41, snr: 4.84},
  {distance: 150, configId: 2, sf: 7, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -109.93, snr: -0.06},
  {distance: 300, configId: 2, sf: 7, pl: 30, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 2, sf: 7, pl: 30, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 3, sf: 7, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -100.7, snr: 7.44},
  {distance: 80, configId: 3, sf: 7, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -102.5, snr: 6.92},
  {distance: 150, configId: 3, sf: 7, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -108.24, snr: 2.5},
  {distance: 300, configId: 3, sf: 7, pl: 30, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 3, sf: 7, pl: 30, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 4, sf: 7, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -106.71, snr: 2.03},
  {distance: 80, configId: 4, sf: 7, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -106.66, snr: 4},
  {distance: 150, configId: 4, sf: 7, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -112.18, snr: -4.68},
  {distance: 300, configId: 4, sf: 7, pl: 70, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 4, sf: 7, pl: 70, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 5, sf: 7, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -104.72, snr: 4.95},
  {distance: 80, configId: 5, sf: 7, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -98.04, snr: 9.56},
  {distance: 150, configId: 5, sf: 7, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -111.64, snr: -2.6},
  {distance: 300, configId: 5, sf: 7, pl: 70, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 5, sf: 7, pl: 70, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 6, sf: 7, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -101.34, snr: 7.72},
  {distance: 80, configId: 6, sf: 7, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -95.88, snr: 10.09},
  {distance: 150, configId: 6, sf: 7, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -111.24, snr: -2.38},
  {distance: 300, configId: 6, sf: 7, pl: 70, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 6, sf: 7, pl: 70, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 7, sf: 7, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.64, snr: 3.69},
  {distance: 80, configId: 7, sf: 7, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -100.12, snr: 9.03},
  {distance: 150, configId: 7, sf: 7, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -110.44, snr: -5.72},
  {distance: 300, configId: 7, sf: 7, pl: 110, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 7, sf: 7, pl: 110, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 8, sf: 7, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -103.21, snr: 6.61},
  {distance: 80, configId: 8, sf: 7, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -97.3, snr: 10.51},
  {distance: 150, configId: 8, sf: 7, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -109.68, snr: -3.79},
  {distance: 300, configId: 8, sf: 7, pl: 110, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 8, sf: 7, pl: 110, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 9, sf: 7, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -98.65, snr: 9.18},
  {distance: 80, configId: 9, sf: 7, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -94.94, snr: 11.03},
  {distance: 150, configId: 9, sf: 7, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -109.76, snr: -4.26},
  {distance: 300, configId: 9, sf: 7, pl: 110, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 9, sf: 7, pl: 110, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  // SF=9 configurations (10-18)
  {distance: 30, configId: 10, sf: 9, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.15, snr: 4.63},
  {distance: 80, configId: 10, sf: 9, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -102.42, snr: 7.02},
  {distance: 150, configId: 10, sf: 9, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -110.41, snr: -7.21},
  {distance: 300, configId: 10, sf: 9, pl: 30, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 10, sf: 9, pl: 30, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 11, sf: 9, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -101.98, snr: 6.95},
  {distance: 80, configId: 11, sf: 9, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -99.29, snr: 8.69},
  {distance: 150, configId: 11, sf: 9, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -110.11, snr: -5.56},
  {distance: 300, configId: 11, sf: 9, pl: 30, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 11, sf: 9, pl: 30, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 12, sf: 9, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -98.74, snr: 8.07},
  {distance: 80, configId: 12, sf: 9, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -96.15, snr: 9.29},
  {distance: 150, configId: 12, sf: 9, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -109, snr: -1.74},
  {distance: 300, configId: 12, sf: 9, pl: 30, pe: 14, recebidos: 0, corruptos: 1, perdidos: 14, rssi: null, snr: null},
  {distance: 600, configId: 12, sf: 9, pl: 30, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 13, sf: 9, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -102.68, snr: 6.29},
  {distance: 80, configId: 13, sf: 9, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -101.85, snr: 7.07},
  {distance: 150, configId: 13, sf: 9, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -110.57, snr: -6.35},
  {distance: 300, configId: 13, sf: 9, pl: 70, pe: 7, recebidos: 0, corruptos: 1, perdidos: 14, rssi: null, snr: null},
  {distance: 600, configId: 13, sf: 9, pl: 70, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 14, sf: 9, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -100.44, snr: 7.82},
  {distance: 80, configId: 14, sf: 9, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -100.41, snr: 7.64},
  {distance: 150, configId: 14, sf: 9, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -109.64, snr: -4.15},
  {distance: 300, configId: 14, sf: 9, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -113.93, snr: -13.03},
  {distance: 600, configId: 14, sf: 9, pl: 70, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 15, sf: 9, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -99.71, snr: 8.29},
  {distance: 80, configId: 15, sf: 9, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -95.57, snr: 9},
  {distance: 150, configId: 15, sf: 9, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -108.12, snr: -0.91},
  {distance: 300, configId: 15, sf: 9, pl: 70, pe: 14, recebidos: 0, corruptos: 2, perdidos: 13, rssi: null, snr: null},
  {distance: 600, configId: 15, sf: 9, pl: 70, pe: 14, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 16, sf: 9, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.5, snr: 4.76},
  {distance: 80, configId: 16, sf: 9, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -102.04, snr: 7},
  {distance: 150, configId: 16, sf: 9, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -109.93, snr: -6.37},
  {distance: 300, configId: 16, sf: 9, pl: 110, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},
  {distance: 600, configId: 16, sf: 9, pl: 110, pe: 7, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 17, sf: 9, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -104.15, snr: 5.8},
  {distance: 80, configId: 17, sf: 9, pl: 110, pe: 10, recebidos: 14, corruptos: 1, perdidos: 0, rssi: -99.44, snr: 8.5},
  {distance: 150, configId: 17, sf: 9, pl: 110, pe: 10, recebidos: 15, corruptos: 1, perdidos: 0, rssi: -109.64, snr: -3.82},
  {distance: 300, configId: 17, sf: 9, pl: 110, pe: 10, recebidos: 14, corruptos: 0, perdidos: 1, rssi: -114, snr: -13.26},
  {distance: 600, configId: 17, sf: 9, pl: 110, pe: 10, recebidos: 0, corruptos: 0, perdidos: 15, rssi: null, snr: null},

  {distance: 30, configId: 18, sf: 9, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -99.09, snr: 8.69},
  {distance: 80, configId: 18, sf: 9, pl: 110, pe: 14, recebidos: 14, corruptos: 1, perdidos: 0, rssi: -99.36, snr: 8.07},
  {distance: 150, configId: 18, sf: 9, pl: 110, pe: 14, recebidos: 15, corruptos: 3, perdidos: 0, rssi: -107.71, snr: -0.06},
  {distance: 300, configId: 18, sf: 9, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -113.93, snr: -11.03},
  {distance: 600, configId: 18, sf: 9, pl: 110, pe: 14, recebidos: 0, corruptos: 1, perdidos: 14, rssi: null, snr: null},

  // SF=12 configurations (19-27)
  {distance: 30, configId: 19, sf: 12, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -104.16, snr: 4},
  {distance: 80, configId: 19, sf: 12, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -101.26, snr: 4.35},
  {distance: 150, configId: 19, sf: 12, pl: 30, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -110, snr: -5.57},
  {distance: 300, configId: 19, sf: 12, pl: 30, pe: 7, recebidos: 13, corruptos: 0, perdidos: 2, rssi: -114.28, snr: -15.88},
  {distance: 600, configId: 19, sf: 12, pl: 30, pe: 7, recebidos: null, corruptos: null, perdidos: null, rssi: null, snr: null},

  {distance: 30, configId: 20, sf: 12, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -100.2, snr: 4.74},
  {distance: 80, configId: 20, sf: 12, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -99.49, snr: 4.88},
  {distance: 150, configId: 20, sf: 12, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -109.31, snr: -3.18},
  {distance: 300, configId: 20, sf: 12, pl: 30, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -114.31, snr: -15.05},
  {distance: 600, configId: 20, sf: 12, pl: 30, pe: 10, recebidos: null, corruptos: null, perdidos: null, rssi: null, snr: null},

  {distance: 30, configId: 21, sf: 12, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -98.25, snr: 5.51},
  {distance: 80, configId: 21, sf: 12, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -97.16, snr: 5.26},
  {distance: 150, configId: 21, sf: 12, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -108.17, snr: -1.29},
  {distance: 300, configId: 21, sf: 12, pl: 30, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -114.06, snr: -11.48},
  {distance: 600, configId: 21, sf: 12, pl: 30, pe: 14, recebidos: null, corruptos: null, perdidos: null, rssi: null, snr: null},

  {distance: 30, configId: 22, sf: 12, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -101.21, snr: 4.18},
  {distance: 80, configId: 22, sf: 12, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -101.88, snr: 3.71},
  {distance: 150, configId: 22, sf: 12, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -110.24, snr: -6.23},
  {distance: 300, configId: 22, sf: 12, pl: 70, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -114.37, snr: -17.79},
  {distance: 600, configId: 22, sf: 12, pl: 70, pe: 7, recebidos: null, corruptos: null, perdidos: null, rssi: null, snr: null},

  {distance: 30, configId: 23, sf: 12, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -99.01, snr: 4.28},
  {distance: 80, configId: 23, sf: 12, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -100.03, snr: 4.88},
  {distance: 150, configId: 23, sf: 12, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -108.88, snr: -4.51},
  {distance: 300, configId: 23, sf: 12, pl: 70, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -114.18, snr: -16.05},
  {distance: 600, configId: 23, sf: 12, pl: 70, pe: 10, recebidos: null, corruptos: null, perdidos: null, rssi: null, snr: null},

  {distance: 30, configId: 24, sf: 12, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -93.89, snr: 5.55},
  {distance: 80, configId: 24, sf: 12, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -97.1, snr: 5.44},
  {distance: 150, configId: 24, sf: 12, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -105.57, snr: -3.06},
  {distance: 300, configId: 24, sf: 12, pl: 70, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -114.04, snr: -14.57},
  {distance: 600, configId: 24, sf: 12, pl: 70, pe: 14, recebidos: null, corruptos: null, perdidos: null, rssi: null, snr: null},

  {distance: 30, configId: 25, sf: 12, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -99.33, snr: 4.34},
  {distance: 80, configId: 25, sf: 12, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -102.21, snr: 3.94},
  {distance: 150, configId: 25, sf: 12, pl: 110, pe: 7, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -110.1, snr: -5.54},
  {distance: 300, configId: 25, sf: 12, pl: 110, pe: 7, recebidos: 13, corruptos: 1, perdidos: 1, rssi: -114.31, snr: -20.7},
  {distance: 600, configId: 25, sf: 12, pl: 110, pe: 7, recebidos: null, corruptos: null, perdidos: null, rssi: null, snr: null},

  {distance: 30, configId: 26, sf: 12, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -95.64, snr: 4.21},
  {distance: 80, configId: 26, sf: 12, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -99.78, snr: 4.69},
  {distance: 150, configId: 26, sf: 12, pl: 110, pe: 10, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -109.44, snr: -3.29},
  {distance: 300, configId: 26, sf: 12, pl: 110, pe: 10, recebidos: 13, corruptos: 1, perdidos: 1, rssi: -114.22, snr: -19.1},
  {distance: 600, configId: 26, sf: 12, pl: 110, pe: 10, recebidos: null, corruptos: null, perdidos: null, rssi: null, snr: null},

  {distance: 30, configId: 27, sf: 12, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -93.42, snr: 5.37},
  {distance: 80, configId: 27, sf: 12, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -97.75, snr: 5.21},
  {distance: 150, configId: 27, sf: 12, pl: 110, pe: 14, recebidos: 15, corruptos: 0, perdidos: 0, rssi: -108.14, snr: -1.38},
  {distance: 300, configId: 27, sf: 12, pl: 110, pe: 14, recebidos: 14, corruptos: 1, perdidos: 0, rssi: -114.12, snr: -18.5},
  {distance: 600, configId: 27, sf: 12, pl: 110, pe: 14, recebidos: null, corruptos: null, perdidos: null, rssi: null, snr: null}
];

  // Estados para controlar filtros e visualização
  const [selectedSF, setSelectedSF] = useState('all');
  const [selectedPE, setSelectedPE] = useState('all');
  const [selectedPL, setSelectedPL] = useState('all');
  const [activeChart, setActiveChart] = useState('rssi');
  const [visibleConfigs, setVisibleConfigs] = useState(new Set());
  const [dataType, setDataType] = useState('nlos'); // 'nlos' ou 'los'

  const activeRawData = dataType === 'nlos' ? rawDataNLOS : rawDataLOS;

  // Processar dados para os gráficos
  const processedData = useMemo(() => {
    // Filtrar dados baseado nos critérios selecionados
    let filteredData = activeRawData.filter(item => {
      if (selectedSF !== 'all' && item.sf !== parseInt(selectedSF)) return false;
      if (selectedPE !== 'all' && item.pe !== parseInt(selectedPE)) return false;
      if (selectedPL !== 'all' && item.pl !== parseInt(selectedPL)) return false;
      return true;
    });

    // Agrupar por distância
    const groupedByDistance = {};
    filteredData.forEach(item => {
      if (!groupedByDistance[item.distance]) {
        groupedByDistance[item.distance] = { distance: item.distance };
      }
      
      const configKey = `Config ${item.configId} (SF${item.sf}, PL${item.pl}, PE${item.pe})`;
      
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
  }, [activeRawData, selectedSF, selectedPE, selectedPL, activeChart]);

  // Obter configurações únicas para legenda
  const uniqueConfigs = useMemo(() => {
    const configs = new Set();
    activeRawData.forEach(item => {
      if (selectedSF === 'all' || item.sf === parseInt(selectedSF)) {
        if (selectedPE === 'all' || item.pe === parseInt(selectedPE)) {
          if (selectedPL === 'all' || item.pl === parseInt(selectedPL)) {
            configs.add(`Config ${item.configId} (SF${item.sf}, PL${item.pl}, PE${item.pe})`);
          }
        }
      }
    });
    return Array.from(configs);
  }, [activeRawData, selectedSF, selectedPE, selectedPL]);

  // Cores para as linhas
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
    '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98',
    '#f0e68c', '#ff6347', '#40e0d0', '#ee82ee', '#90ee90'
  ];

  // Toggle visibility de configuração
  const toggleConfigVisibility = (config) => {
    const newVisible = new Set(visibleConfigs);
    if (newVisible.has(config)) {
      newVisible.delete(config);
    } else {
      newVisible.add(config);
    }
    setVisibleConfigs(newVisible);
  };

  // Mostrar todas ou esconder todas
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

        {/* Gráfico */}
        <div className="chart-wrapper" style={{ height: '500px' }}>
          <h3 className="chart-title">
            {activeChart === 'rssi' ? 'RSSI vs Distância' :
            activeChart === 'snr' ? 'SNR vs Distância' : 
            'Taxa de Sucesso vs Distância'}
          </h3>
          
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
                formatter={(value) => [value !== null ? value.toFixed(2) : 'N/A']}
                labelFormatter={(label) => `Distância: ${label}m`}
              />
              <Legend />
              
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
      </div>
    </div>
  );
};

export default LoRaAnalyzer;