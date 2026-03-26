<script setup>
import SectionCard from '@/components/ui/SectionCard.vue';
import { ref } from 'vue';

const inventoryManagementDataMax = ref(500);
const inventoryManagementData = ref([
    {
        x: '500',
        y: [123, 87, 156]
    },
    {
        x: '400',
        y: [98, 175, 43]
    },
    {
        x: '300',
        y: [54, 129, 190]
    },
    {
        x: '200',
        y: [88, 144, 72]
    },
    {
        x: '100',
        y: [67, 192, 35]
    }
]);

const inventoryManagementHeader = ref([
    {
        title: 'Stock Status',
        value: '22.543',
        change: '24%',
        status: 'success',
        color: 'primary-color'
    },
    {
        title: 'Inventory Turnover',
        value: '17.472',
        change: '28%',
        status: 'success',
        color: 'orange-500'
    },
    {
        title: 'Products Ordered',
        value: '19.582',
        change: '22%',
        status: 'success',
        color: 'yellow-500'
    }
]);
</script>

<template>
    <SectionCard class="flex flex-col gap-6">
        <template #title>Inventory Management</template>
        <div class="flex-1 flex flex-col">
            <div class="flex flex-wrap gap-4 items-center justify-between">
                <div v-for="(item, index) of inventoryManagementHeader" :key="index" class="flex gap-2">
                    <div :style="{ background: `var(--p-${item.color})` }" class="w-2 rounded-full shadow-[0px_3px_1px_0px_rgba(0,0,0,0.00),0px_2px_1px_0px_rgba(0,0,0,0.01),0px_1px_1px_0px_rgba(0,0,0,0.02),0px_0px_1px_0px_rgba(0,0,0,0.03)]" />
                    <div>
                        <div class="inline-flex items-center gap-1">
                            <span class="text-2xl font-medium text-surface-950 dark:text-surface-0">{{ item.value }}</span>
                            <span :class="item.status === 'success' ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium inline-flex gap-1 items-center">
                                <i class="pi text-sm!" :class="item.status === 'success' ? 'pi-arrow-up-right' : 'pi-arrow-down-left'" />
                                <span class="flex-1">{{ item.change }}</span>
                            </span>
                        </div>
                        <div class="mt-1 text-sm text-surface-500 dark:text-white/64">{{ item.title }}</div>
                    </div>
                </div>
            </div>
            <div class="mt-8 flex-1 flex flex-col justify-between gap-3">
                <div v-for="(item, index) of inventoryManagementData" :key="index" class="flex items-center gap-3">
                    <span class="text-sm text-surface-400 dark:text-white/64 w-7">{{ item.x }}</span>
                    <div
                        class="h-4 flex-1 flex rounded overflow-hidden bg-primary-100/36 dark:bg-white/6 shadow-[inset_0px_3px_6px_0px_color-mix(in_srgb,var(--p-primary-300)_60%,transparent_40%)] dark:shadow-[0px_1px_6px_0px_rgba(255,255,255,0.24)_inset]"
                    >
                        <div
                            v-for="(x, j) of item.y"
                            :key="'x-' + j"
                            class="h-full shadow-[0px_0px_10px_0px_rgba(0,0,0,0.03)_inset]"
                            :class="j === item.y.length - 1 && 'rounded-r'"
                            :style="{ width: (100 * x) / inventoryManagementDataMax + '%', background: `var(--p-${inventoryManagementHeader[j].color})` }"
                        />
                    </div>
                </div>
            </div>
        </div>
    </SectionCard>
</template>
