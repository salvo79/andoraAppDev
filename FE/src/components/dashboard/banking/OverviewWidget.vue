<script setup>
import SectionCard from '@/components/ui/SectionCard.vue';
import BarChart from '@/components/ui/charts/BarChart.vue';
import { generateRandomData } from '@/lib/utils';
import { onBeforeMount, ref } from 'vue';

const randomData = ref(null);

onBeforeMount(() => {
    randomData.value = generateRandomData('2020-10-27T00:00:00', '2023-11-03T00:00:00', 4, 10000, 50000, 2);
});
</script>

<template>
    <SectionCard class="flex-1 flex flex-col">
        <template #title>
            <h4>Overview</h4>
        </template>
        <template #action>
            <div class="flex items-center gap-2">
                <div class="px-3 py-1 rounded-full bg-surface-0 dark:bg-white/10 border dark:border-white/8 inline-flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary-500" />
                    <span class="text-sm font-medium text-surface-950 dark:text-surface-0">Revenue</span>
                </div>
            </div>
        </template>
        <div class="flex-1 mt-6 w-full overflow-auto">
            <BarChart :label="'Revenue'" :dataset="randomData" tooltipPrefix="$" :option="'month'" className="min-w-[640px] max-h-80 flex-1 h-full w-full cursor-pointer" :stepSize="10000" />
        </div>
    </SectionCard>
</template>
