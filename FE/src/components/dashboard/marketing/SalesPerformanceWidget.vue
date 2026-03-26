<script setup>
import SectionCard from '@/components/ui/SectionCard.vue';
import { ref } from 'vue';

const salesPerformanceMax = ref(500);
const salesPerformanceData = ref([
    { x: '1', y: 234 },
    { x: '2', y: 420 },
    { x: '3', y: 152 },
    { x: '4', y: 398 },
    { x: '5', y: 73 },
    { x: '6', y: 420 },
    { x: '7', y: 365 },
    { x: '8', y: 298 },
    { x: '9', y: 99 },
    { x: '10', y: 451 },
    { x: '11', y: 183 },
    { x: '12', y: 312 },
    { x: '13', y: 276 },
    { x: '14', y: 415 }
]);
const salesPerformanceHeader = ref([
    {
        title: 'Weekly Revenue',
        value: '$2.302',
        change: '29%',
        status: 'success'
    },
    {
        title: 'Monthly Income',
        value: '$72.302',
        change: '48%',
        status: 'success'
    },
    {
        title: 'Annual Income ',
        value: '$780.302',
        change: '64%',
        status: 'success'
    }
]);
</script>

<template>
    <SectionCard class="flex flex-col gap-6">
        <template #title>Sales Performance</template>
        <div class="flex-1 flex flex-col">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div v-for="(item, index) of salesPerformanceHeader" :key="index">
                    <div class="inline-flex items-center gap-1">
                        <span class="text-lg md:text-2xl font-medium text-surface-950 dark:text-surface-0">{{ item.value }}</span>
                        <span :class="item.status === 'success' ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium inline-flex gap-1 items-center">
                            <i class="pi text-sm!" :class="item.status === 'success' ? 'pi-arrow-up-right' : 'pi-arrow-down-left'" />
                            <span class="flex-1">{{ item.change }}</span>
                        </span>
                    </div>
                    <div class="mt-1 text-sm text-surface-500 dark:text-white/64">{{ item.title }}</div>
                </div>
            </div>
            <div class="mt-8 flex-1 flex gap-3 justify-between overflow-auto">
                <div v-for="(item, index) of salesPerformanceData" :key="index" class="flex flex-col items-center gap-3">
                    <div
                        class="flex-1 min-h-44 w-4 flex flex-col items-end justify-end rounded overflow-hidden bg-primary-100/36 dark:bg-white/6 shadow-[inset_0px_3px_6px_0px_color-mix(in_srgb,var(--p-primary-300)_60%,transparent_40%)] dark:shadow-[0px_1px_6px_0px_rgba(255,255,255,0.24)_inset]"
                    >
                        <div
                            class="w-full bg-primary rounded shadow-[inset_0px_3px_6px_0px_color-mix(in_srgb,var(--p-primary-300)_60%,transparent_40%),inset_0px_0px_10px_0px_rgba(0,0,0,0.03)] dark:shadow-[0px_3px_6px_0px_rgba(255,255,255,0.24)_inset,0px_0px_10px_0px_rgba(0,0,0,0.03)_inset]"
                            :style="{ height: (item.y * 100) / salesPerformanceMax + '%' }"
                        />
                    </div>
                    <span class="text-sm text-surface-400 dark:text-white/64">
                        {{ item.x.padStart(2, '0') }}
                    </span>
                </div>
            </div>
        </div>
    </SectionCard>
</template>
