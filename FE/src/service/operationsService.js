// src/service/operationsService.js
import api from './api';

export const operationsService = {
    /**
     * Retorna los KPIs del strip del dashboard de operaciones.
     * @param {number} dias - Ventana de días a calcular (default 30)
     */
    async getKpis(dias = 30) {
        const { data } = await api.get('/operations/kpis', { params: { dias } });
        return data;
    }
};
