<script setup>
import SectionCard from '@/components/ui/SectionCard.vue';
import { useLayout } from '@/layout/composables/layout';
import { ref } from 'vue';

const { isDarkTheme } = useLayout();

const totalVisit = ref({
    change: '64%',
    status: 'success',
    value: '1,772.480'
});
const visitByDevice = ref([
    {
        title: 'Web',
        change: '24%',
        status: 'success',
        value: 44,
        color: {
            name: 'primary',
            background: 'color'
        }
    },
    {
        title: 'Mobile',
        change: '16%',
        status: 'danger',
        value: 36,
        color: {
            name: 'orange',
            background: '500'
        }
    },
    {
        title: 'Tablet',
        change: '12%',
        status: 'success',
        value: 20,
        color: {
            name: 'surface',
            background: '400'
        }
    }
]);
</script>

<template>
    <SectionCard>
        <template #title> Visit by Device </template>
        <div class="mt-4">
            <div class="p-2 pb-3 rounded-xl bg-white/64 dark:bg-white/10 shadow-v2">
                <div class="p-2 bg-surface-0 dark:bg-white/12 flex items-center justify-between gap-2 rounded-lg shadow-v1">
                    <div class="font-medium text-surface-500 dark:text-white">Total Visit</div>
                    <div class="inline-flex gap-1 items-center" :class="totalVisit.status === 'success' ? 'text-green-600' : 'text-red-600'">
                        <i class="pi text-sm!" :class="totalVisit.status === 'success' ? 'pi-arrow-up-right' : 'pi-arrow-down-left'" />
                        <span class="text-sm font-medium">{{ totalVisit.change }}</span>
                    </div>
                </div>
                <div class="mt-3 text-3xl font-medium text-center text-surface-950 dark:text-surface-0">
                    {{ totalVisit.value }}
                </div>
            </div>
            <div class="mt-4 flex gap-4 justify-between">
                <div v-for="(item, index) of visitByDevice" :key="index" class="flex-1 max-w-28 space-y-2">
                    <div class="flex items-center justify-between gap-1">
                        <div class="text-sm font-medium text-surface-500 dark:text-white">{{ item.title }}</div>
                        <div class="inline-flex gap-1" :class="item.status === 'success' ? 'text-green-600' : 'text-red-600'">
                            <i class="pi text-sm!" :class="item.status === 'success' ? 'pi-arrow-up-right' : 'pi-arrow-down-left'" />
                            <span class="text-sm font-medium">{{ item.change }}</span>
                        </div>
                    </div>
                    <div class="h-28 bg-white/64 dark:bg-white/10 rounded-xl overflow-hidden shadow-v2 relative flex flex-col">
                        <div class="flex-1 flex flex-col items-center pt-0.5">
                            <div class="w-2 h-2 rounded-full" :style="{ background: `var(--p-${item.color.name}-300)` }" />
                            <div class="flex-1 border-r border-dashed" :style="{ borderColor: `var(--p-${item.color.name}-300)` }" />
                        </div>
                        <div
                            class="relative w-full flex items-center justify-center"
                            :style="{
                                height: item.value + '%',
                                background: `var(--p-${item.color.name}-${item.color.background})`,
                                boxShadow: isDarkTheme ? '0px 3px 6px 0px rgba(255, 255, 255, 0.24) inset' : `inset 0px 3px 6px 0px color-mix(in srgb, var(--p-${item.color.name}-300) 60%, transparent 40%)`
                            }"
                        >
                            <div class="text-sm font-medium" :class="item.color.name === 'primary' ? 'text-primary-contrast' : 'text-white'">%{{ item.value }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </SectionCard>
</template>
