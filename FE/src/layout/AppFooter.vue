<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useGlobalVarsStore } from '@/stores/GlobalVars';

const gv = useGlobalVarsStore();
const { isDarkTheme } = useLayout();
</script>

<template>
    <div class="layout-footer">
        <div class="footer-logo-container">
            <img :src="`/layout/images/logo-${isDarkTheme ? 'white' : 'dark'}.svg`" alt="poseidon-layout" />
            <span class="footer-app-name">{{ gv.appName }}</span>
        </div>
        <span class="footer-copyright">&#169; {{ gv.company }} - {{ gv.year }}</span>
    </div>
</template>
