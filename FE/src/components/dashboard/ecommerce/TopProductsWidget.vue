<script setup>
import SectionCard from '@/components/ui/SectionCard.vue';
import MultiLineChart from '@/components/ui/charts/MultiLineChart.vue';
import { generateRandomMultiData } from '@/lib/utils';
import { onBeforeMount, ref } from 'vue';

const randomData = ref(null);

onBeforeMount(() => {
    randomData.value = generateRandomMultiData('2020-10-27T00:00:00', '2023-11-03T00:00:00', 4, 2000, 3000, 2, true);
});

const topProductChartRanges = [
    { name: 'Weekly', unit: 'week' },
    { name: 'Monthly', unit: 'month' },
    { name: 'Quarter', unit: 'quarter' },
    { name: 'Yearly', unit: 'year' }
];
const selectedTopProductChartRange = ref({ name: 'Yearly', unit: 'year' });
</script>

<template>
    <SectionCard class="xl:flex-1 xl:col-span-2 flex flex-col">
        <template #title>Top Products</template>
        <template #action>
            <Select v-model="selectedTopProductChartRange" :options="topProductChartRanges" optionLabel="name" placeholder="Select a Range" class="w-28" />
        </template>
        <div class="flex-1 w-full overflow-auto mt-5">
            <MultiLineChart
                :datasets="randomData"
                :labels="['Income', 'Expenses']"
                :bgColors="[
                    ['rgba(37, 99, 235, 0.12)', 'rgba(37, 99, 235, 0)'],
                    ['rgba(234, 127, 51, 0.15)', 'rgba(234, 127, 51, 0)']
                ]"
                :borderColors="['rgba(37, 99, 235, 1)', 'rgba(234, 127, 51, 1)']"
                :option="selectedTopProductChartRange.unit"
                className="min-w-[26rem] min-h-72"
            />
        </div>
    </SectionCard>
</template>
