<script setup>
import HeatmapChart from '@/components/ui/charts/HeatmapChart.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import { useLayout } from '@/layout/composables/layout';
import { generateRandomHeatmapData } from '@/lib/utils';
import { onBeforeMount, ref } from 'vue';

const { isDarkTheme } = useLayout();

const heatmapConditions = ref([
    { min: 200, max: 500, color: { light: '--p-primary-200', dark: '--p-primary-950' } },
    { min: 501, max: 800, color: { light: '--p-primary-300', dark: '--p-primary-800' } },
    { min: 801, max: 1000, color: { light: '--p-primary-400', dark: '--p-primary-700' } },
    { min: 1001, max: 1500, color: { light: '--p-primary-color', dark: '--p-primary-color' } }
]);

const randomHeatmapData = ref();
onBeforeMount(() => {
    randomHeatmapData.value = generateRandomHeatmapData();
});
</script>

<template>
    <SectionCard class="flex flex-col gap-4">
        <template #title>Promotion and Campaign Performance</template>
        <div class="flex-1 pt-0 pb-2 border-y border-surface dark:border-white/8">
            <HeatmapChart :dataset="randomHeatmapData" :conditions="heatmapConditions" />
        </div>
        <div class="flex items-center justify-between">
            <div v-for="(item, index) of heatmapConditions" :key="index" class="inline-flex items-center gap-2">
                <span
                    class="h-2.5 w-10 rounded-sm shadow-[0px_3px_6px_0px_rgba(255,255,255,0.30)_inset,0px_10px_10px_-8px_rgba(18,18,23,0.02),0px_2px_2px_-1.5px_rgba(18,18,23,0.02),0px_1px_1px_-0.5px_rgba(18,18,23,0.02)]"
                    :style="{ background: `var(${isDarkTheme ? item.color.dark : item.color.light})` }"
                />
                <span class="text-sm font-medium text-surface-950 dark:text-white">{{ item.min.toLocaleString('en-US') }} - {{ item.max.toLocaleString('en-US') }}</span>
            </div>
        </div>
    </SectionCard>
</template>
