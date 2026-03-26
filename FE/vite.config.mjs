//vite.config.mjs
import { fileURLToPath, URL } from 'node:url';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        noDiscovery: true,
        include: ['quill',
                  'knockout',
                  'devexpress-dashboard',
                  'devexpress-dashboard-vue',
                  '@devexpress/analytics-core',
                  'devexpress-dashboard/designer/text-box-item-editor-extension'
                ]
    },
    base: process.env.DEPLOY_TARGET === 'gh-pages' ? '/andoraAppDev/' : '/',
    plugins: [
        vue(),
        tailwindcss(),
        Components({
            resolvers: [PrimeVueResolver()]
        })
    ],
        build: {
        commonjsOptions: {
            transformMixedEsModules: true
        }
    },
    resolve: {
          dedupe: [
    'knockout',
    'devextreme',
    '@devexpress/analytics-core'
  ],
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    },
    // 🔹 IMPORTANTE PARA TU API .NET
    server: {
        proxy: {
            '/api': {
                target: 'https://localhost:5236',
                changeOrigin: true,
                secure: false
            }
        }
    }
});
