// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import '@/assets/preloading/preloading.css'

import BlockViewer from '@/components/BlockViewer.vue'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

import '@/assets/tailwind.css'
import '@/assets/styles.scss'

// DevExpress
//import config from 'devextreme/core/config'
//import { licenseKey } from '../devextreme-license2.js'
//config({ licenseKey })
import config from 'devextreme/core/config'
config({ licenseKey: import.meta.env.VITE_DEVEXTREME_LICENSE })



import 'devextreme/dist/css/dx.light.css'
import 'devexpress-dashboard/dist/css/dx-dashboard.light.css'
import '@devexpress/analytics-core/dist/css/dx-analytics.common.css'
import '@devexpress/analytics-core/dist/css/dx-analytics.light.css'
import 'devexpress-richedit/dist/dx.richedit.css'

// Auth Store
import { useAuthStore } from '@/stores/authStore'

/* ===========================
   CREATE APP
=========================== */

const app = createApp(App)

/* ===========================
   PINIA
=========================== */

const pinia = createPinia()
app.use(pinia)

/* ===========================
   ROUTER
=========================== */

app.use(router)

/* ===========================
   PRIMEVUE THEME
=========================== */

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        },
        overlay: {
            modal: { borderRadius: '1.5rem' },
            popover: { borderRadius: '10px' }
        },
        colorScheme: {
            light: {
                surface: {
                    0: 'color-mix(in srgb, {primary.950}, white 100%)',
                    50: 'color-mix(in srgb, {primary.950}, white 95%)',
                    100: 'color-mix(in srgb, {primary.950}, white 90%)',
                    200: 'color-mix(in srgb, {primary.950}, white 80%)',
                    300: 'color-mix(in srgb, {primary.950}, white 70%)',
                    400: 'color-mix(in srgb, {primary.950}, white 60%)',
                    500: 'color-mix(in srgb, {primary.950}, white 50%)',
                    600: 'color-mix(in srgb, {primary.950}, white 40%)',
                    700: 'color-mix(in srgb, {primary.950}, white 30%)',
                    800: 'color-mix(in srgb, {primary.950}, white 20%)',
                    900: 'color-mix(in srgb, {primary.950}, white 10%)',
                    950: 'color-mix(in srgb, {primary.950}, white 5%)'
                }
            },
            dark: {
                surface: {
                    0: 'color-mix(in srgb, var(--surface-ground), white 100%)',
                    50: 'color-mix(in srgb, var(--surface-ground), white 95%)',
                    100: 'color-mix(in srgb, var(--surface-ground), white 90%)',
                    200: 'color-mix(in srgb, var(--surface-ground), white 80%)',
                    300: 'color-mix(in srgb, var(--surface-ground), white 70%)',
                    400: 'color-mix(in srgb, var(--surface-ground), white 60%)',
                    500: 'color-mix(in srgb, var(--surface-ground), white 50%)',
                    600: 'color-mix(in srgb, var(--surface-ground), white 40%)',
                    700: 'color-mix(in srgb, var(--surface-ground), white 30%)',
                    800: 'color-mix(in srgb, var(--surface-ground), white 20%)',
                    900: 'color-mix(in srgb, var(--surface-ground), white 10%)',
                    950: 'color-mix(in srgb, var(--surface-ground), white 5%)'
                }
            }
        }
    }
})

app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
})

/* ===========================
   SERVICES
=========================== */

app.use(ToastService)
app.use(ConfirmationService)

/* ===========================
   GLOBAL COMPONENTS
=========================== */

app.component('BlockViewer', BlockViewer)

/* ===========================
   LOAD AUTH SESSION
=========================== */

const auth = useAuthStore()
auth.loadSession()

/* ===========================
   MOUNT APP
=========================== */

app.mount('#app')