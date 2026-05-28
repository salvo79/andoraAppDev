// src/service/operationsService.js
import api from './api';

export const operationsService = {
    async getKpis(dias = 30) {
        const { data } = await api.get('/operations/kpis', { params: { dias } });
        return data;
    },

    // Árbol de Producción / Compras / Ventas desde Atlas
    async getProcessTree() {
        const { data } = await api.get('/operations/process-tree');
        return data;
    },

    // Serie temporal de una métrica operativa
    // source: 'produccion' | 'precios'
    // params: { planta_id?, nombre?, metrica }
    // range: '1d' | '7d' | '1mo' | '1y' | 'all'
    async getSeries(source, params, range = '1mo') {
        const query = { source, range };
        if (params.planta_id) query.planta_id = params.planta_id;
        if (params.nombre)    query.nombre    = params.nombre;
        if (params.metrica)   query.metrica   = params.metrica;
        const { data } = await api.get('/operations/series', { params: query });
        return data; // [{ fecha: 'YYYY-MM-DD', valor: number }]
    },
};
