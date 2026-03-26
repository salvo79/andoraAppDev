<script setup>
import SectionCard from '@/components/ui/SectionCard.vue';
import { ref } from 'vue';
const selectedTrafficMeterRange = ref({ name: 'Yearly', unit: 'year' });

const trafficMeterRanges = [
    { name: 'Weekly', unit: 'week' },
    { name: 'Monthly', unit: 'month' },
    { name: 'Quarter', unit: 'quarter' },
    { name: 'Yearly', unit: 'year' }
];
const traffic = ref([
    { label: 'Facebook', color: '#F59E0B', value: 22 },
    { label: 'Twitter', color: '#677489', value: 5 },
    { label: 'Instagram', color: '#22C55E', value: 15 },
    { label: 'Reddit', color: '#84CC16', value: 7 },
    { label: 'Shopify', color: '#14B8A6', value: 8 },
    { label: 'eBay', color: '#EAB308', value: 11 }
]);
</script>

<template>
    <SectionCard class="xl:col-span-1 flex flex-col">
        <template #title>Traffic</template>
        <template #action>
            <Select v-model="selectedTrafficMeterRange" :options="trafficMeterRanges" optionLabel="name" placeholder="Select a Range" class="w-28" />
        </template>
        <MeterGroup :value="traffic" labelPosition="end" class="mt-6 flex-1">
            <template #meter="slotProps">
                <span :class="[slotProps.class, slotProps.index === 0 && 'rounded-r-sm rounded-l-full', slotProps.index > 0 && 'rounded-sm ml-px']" :style="{ background: slotProps.value.color, width: slotProps.size }" />
            </template>
            <template #label="{ value }">
                <div class="flex-1 flex flex-col justify-between gap-4">
                    <template v-for="val of value" :key="val.label">
                        <div class="flex items-center gap-2">
                            <span
                                class="w-2 h-2 rounded-full border border-surface-0 dark:border-surface-950 shadow-[0px_3px_1px_0px_rgba(0,0,0,0.00),0px_2px_1px_0px_rgba(0,0,0,0.01),0px_1px_1px_0px_rgba(0,0,0,0.02),0px_0px_1px_0px_rgba(0,0,0,0.03)]"
                                :style="{ background: val.color }"
                            />
                            <span class="flex-1 text-surface-600 dark:text-white/64">{{ val.label }}</span>
                            <span class="font-medium text-surface-950 dark:text-surface-0">{{ val.value }}%</span>
                        </div>
                    </template>
                </div>
            </template>
        </MeterGroup>
    </SectionCard>
</template>
