<script setup>
import { useGlobalVarsStore } from '@/stores/GlobalVars';
const globalVars = useGlobalVarsStore();
</script>

<template>
    <div class="flex items-center gap-2">
        <img src="/andora.svg" alt="anDora" class="h-10" />
        <span class="font-semibold text-xl text-surface-950 dark:text-surface-0">{{ globalVars.appName }}</span>
    </div>
</template>
