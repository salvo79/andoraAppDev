// GlobalVars.js
import { defineStore } from 'pinia';

export const useGlobalVarsStore = defineStore('globalVars', {
  state: () => ({
    appName: 'anDora',
    version: '3.4.0',
    developer: 'Salvador de Lira',
    description: 'Sistema de análisis y visualización de datos industriales',
    company: 'Andora Analytics',
    apiBaseUrl: import.meta.env.VITE_API_BASE || 'https://localhost:44395/api',
    environment: import.meta.env.MODE,
    year:'2026',
    firm: 'KI ADVISORY & STRATEGY',

  }),

  getters: {
    fullAppTitle: (state) => `${state.appName} v${state.version}`
  }
});