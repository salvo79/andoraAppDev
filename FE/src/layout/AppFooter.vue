<script setup>
import { useGlobalVarsStore } from '@/stores/GlobalVars';

const gv = useGlobalVarsStore();
</script>

<template>
    <div class="layout-footer">
        <div class="footer-logo-container">
            <img src="/andora.svg" alt="anDora" />
            <span class="footer-app-name">{{ gv.appName }}</span>
        </div>
        <span class="footer-copyright">&#169; {{ gv.company }} - {{ gv.year }}</span>
    </div>
</template>
