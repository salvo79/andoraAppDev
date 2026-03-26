//authStore.js
import { defineStore } from 'pinia';
//import api from '@/service/api';
import api from '../service/api.js';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        roles: [],
        isAuthenticated: false
    }),

    actions: {
        async login(credentials) {
            try {
                const response = await api.post('/auth/login', {
                    username: credentials.username,
                    passwordHash: credentials.password
                });

                this.user = response.data.username;
                this.roles = response.data.roles;
                this.isAuthenticated = true;

                return true;
            } catch (error) {
                console.error(error);
                throw error;
            }
        },

        logout() {
            this.user = null;
            this.roles = [];
            this.isAuthenticated = false;
        },
        // ✅ Nueva función para cargar sesión desde localStorage
        loadSession() {
        const stored = localStorage.getItem('auth');
        if (stored) {
            const data = JSON.parse(stored);
            this.user = data.user;
            this.roles = data.roles;
            this.isAuthenticated = true;
            }
        }
    }
});