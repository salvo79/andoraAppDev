<script setup>
import MultiLineChart from '@/components/ui/charts/MultiLineChart.vue';
</script>

<template>
    <SectionCard class="flex flex-col justify-between gap-4">
        <template #title>Email Data Chart</template>
        <template #action>
            <div class="flex items-center gap-2">
                <div class="px-3 py-1 rounded-full bg-surface-0 dark:bg-white/10 border dark:border-white/8 inline-flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-orange-500" />
                    <span class="text-sm font-medium text-surface-950 dark:text-surface-0">Click Through Rate</span>
                </div>
                <div class="px-3 py-1 rounded-full bg-surface-0 dark:bg-white/10 border dark:border-white/8 inline-flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary-500" />
                    <span class="text-sm font-medium text-surface-950 dark:text-surface-0">Open Rate</span>
                </div>
            </div>
        </template>
        <div class="flex-1 min-h-72">
            <MultiLineChart
                :datasets="[
                    { x: new Date('2014-04-12'), y: [110000, 20000] },
                    { x: new Date('2015-04-12'), y: [320000, 180000] },
                    { x: new Date('2016-04-12'), y: [490000, 300000] },
                    { x: new Date('2017-04-12'), y: [475000, 360000] },
                    { x: new Date('2018-04-12'), y: [420000, 480000] },
                    { x: new Date('2019-04-12'), y: [400000, 460000] },
                    { x: new Date('2020-04-12'), y: [410000, 390000] },
                    { x: new Date('2021-04-12'), y: [285000, 340000] },
                    { x: new Date('2022-04-12'), y: [282000, 374000] },
                    { x: new Date('2023-04-12'), y: [100000, 100000] }
                ]"
                :labels="['Click Through Rate', 'Open Rate']"
                :bgColors="[
                    ['rgba(234, 127, 51, 0.15)', 'rgba(234, 127, 51, 0)'],
                    ['rgba(37, 99, 235, 0.12)', 'rgba(37, 99, 235, 0)']
                ]"
                :borderColors="['rgba(234, 127, 51, 1)', 'rgba(37, 99, 235, 1)']"
                :option="'year'"
                :stepSize="100000"
                :dataReduction="false"
                tooltip-prefix=""
            />
        </div>
    </SectionCard>
</template>
