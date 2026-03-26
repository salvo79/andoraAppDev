<script setup>
import SectionCard from '@/components/ui/SectionCard.vue';
import GaugeChart from '@/components/ui/charts/GaugeChart.vue';
import { ref } from 'vue';

const totalAudience = ref(17772480);
const audienceByGender = ref([
    {
        label: 'Woman Visitor',
        color: 'primary-color',
        percentage: 60
    },
    {
        label: 'Men Visitor',
        color: 'green-500',
        percentage: 40
    }
]);
</script>

<template>
    <SectionCard class="flex flex-col">
        <template #title> Audience By Gender </template>
        <div class="flex-1 flex items-center justify-center">
            <GaugeChart
                :data="audienceByGender.map((item) => (totalAudience * item.percentage) / 100)"
                :labels="audienceByGender.map((item) => item.label)"
                :bgColors="audienceByGender.map((item) => item.color)"
                title="All Gender"
                :description="totalAudience.toLocaleString('en-US')"
            />
        </div>
        <div class="p-3 rounded-lg w-full flex items-center gap-8 justify-between bg-surface-0 dark:bg-white/10 shadow-v1">
            <div v-for="(item, index) of audienceByGender" :key="index" class="flex-1 flex items-center">
                <div class="w-1 h-4 rounded-full shadow-[0px_3px_1px_0px_rgba(0,0,0,0.00),0px_2px_1px_0px_rgba(0,0,0,0.01),0px_1px_1px_0px_rgba(0,0,0,0.02),0px_0px_1px_0px_rgba(0,0,0,0.03)]" :style="{ background: `var(--p-${item.color})` }" />
                <div class="ml-3 mr-2 text-sm text-surface-950 dark:text-surface-0">{{ item.label }}</div>
                <div class="font-medium" :style="{ color: `var(--p-${item.color})` }">{{ item.percentage }}%</div>
            </div>
        </div>
    </SectionCard>
</template>
