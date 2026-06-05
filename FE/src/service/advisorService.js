// src/service/advisorService.js
import axios from 'axios';

// Instancia dedicada al advisor con timeout mayor (el agente puede tardar varios segundos)
const advisorApi = axios.create({
    baseURL: import.meta.env.PROD
        ? 'https://andora-app-843120821405.us-central1.run.app/api'
        : '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 120_000  // 2 min — el loop agentic puede tener varias iteraciones
});

advisorApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

advisorApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/landing/login';
        }
        return Promise.reject(error);
    }
);

export const advisorService = {
    /**
     * Envía un mensaje al agente Advisor.
     * @param {string} message - Mensaje del usuario
     * @param {{ role: string, content: string }[]} history - Historial previo
     * @returns {Promise<string>} - Respuesta del agente
     */
    async chat(message, history = []) {
        const { data } = await advisorApi.post('/advisor/chat', { message, history });
        return data.reply;
    }
};
