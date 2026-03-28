//authStore.js
import { defineStore } from 'pinia';
//import api from '@/service/api';
import api from '../service/api.js';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        roles: [],
        isAuthenticated: false,
        profilePhoto: null
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
            this.profilePhoto = null;
            localStorage.removeItem('token');
            localStorage.removeItem('profilePhoto');
        },

        loadSession() {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
                    if (username) {
                        this.user = username;
                        this.isAuthenticated = true;
                        this.profilePhoto = localStorage.getItem('profilePhoto') || null;
                    }
                } catch {
                    this.isAuthenticated = false;
                }
            }
        },

        setProfilePhoto(photo) {
            this.profilePhoto = photo;
            if (photo) localStorage.setItem('profilePhoto', photo);
            else localStorage.removeItem('profilePhoto');
        }
    }
});