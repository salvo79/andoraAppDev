<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, watch } from 'vue';

const props = defineProps({
    data: {
        type: Array,
        default: () => [80, 20]
    },
    labels: {
        type: Array,
        default: () => ['Score', 'Gray Area']
    },
    bgColors: {
        type: Array
    },
    title: {
        type: String
    },
    description: {
        type: String
    }
});

const chartData = ref({});
const chartOptions = ref({});
const chartPlugins = ref([]);
const chartDim = ref({ width: '100%', height: '100%' });
const { isDarkTheme, layoutConfig } = useLayout();

watch(
    [() => isDarkTheme.value, () => layoutConfig.primary],
    () => {
        chartData.value = setChartData();
        chartOptions.value = setChartOptions();
        chartPlugins.value = setChartPlugins();
    },
    { immediate: true }
);

function setChartPlugins() {
    return [];
}

function setChartData() {
    const rootStyles = getComputedStyle(document.documentElement);

    return {
        labels: props.labels,
        datasets: [
            {
                label: '',
                data: props.data,
                backgroundColor: props.bgColors.map((color) => {
                    return rootStyles.getPropertyValue(`--p-${color}`).trim();
                }),
                borderWidth: 0,
                spacing: 6,
                borderRadius: 6,
                cutout: '80%',
                circumference: 180,
                rotation: 270
            }
        ]
    };
}

function setChartOptions() {
    return {
        aspectRatio: 1.5,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false,
                position: 'nearest',
                external: function (context) {
                    const { chart, tooltip } = context;
                    let tooltipEl = chart.canvas.parentNode.querySelector('div.chartjs-tooltip');
                    if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.classList.add(
                            'chartjs-tooltip',
                            'dark:bg-surface-950',
                            'bg-surface-0',
                            'rounded-[8px]',
                            'overflow-hidden',
                            'opacity-100',
                            'border',
                            'border-surface',
                            'absolute',
                            'transition-all',
                            'duration-[0.05s]',
                            'pointer-events-none',
                            'shadow-[0px_16px_32px_-12px_rgba(88,92,95,0.10)]'
                        );
                        chart.canvas.parentNode.appendChild(tooltipEl);
                    }

                    if (tooltip.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }
                    tooltipEl.innerHTML = '';
                    if (tooltip.body) {
                        const tooltipBody = document.createElement('div');
                        tooltipBody.classList.add('flex', 'itens-center', 'justify-center', 'gap-2', 'px-3', 'py-1.5', 'min-w-[3rem]');
                        const value = document.createElement('span');
                        value.appendChild(document.createTextNode(tooltip.dataPoints[0].parsed.toLocaleString('en-US')));
                        value.classList.add('font-semibold', 'text-base', 'text-surface-950', 'dark:text-surface-0', 'text-right');
                        tooltipBody.appendChild(value);
                        tooltipEl.appendChild(tooltipBody);
                    }
                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.font = tooltip.options.bodyFont.string;
                    tooltipEl.style.padding = 0;

                    tooltipEl.style.left = tooltip.x + 'px';
                    tooltipEl.style.top = tooltip.y + 'px';
                }
            }
        }
    };
}
</script>

<template>
    <div class="relative min-h-32 flex items-center justify-center">
        <Chart type="doughnut" :data="chartData" :options="chartOptions" :plugins="chartPlugins" class="h-auto relative z-50 mx-auto cursor-pointer max-w-full lg:max-w-2/4" />
        <div v-if="title || description" class="absolute z-20 bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-end transition-all" :style="{ width: chartDim.width + 'px', height: chartDim.height + 'px' }">
            <h2 v-if="title" class="text-center font-medium text-surface-500 dark:text-white/64">{{ title }}</h2>
            <p v-if="description" class="mt-1 text-center text-2xl font-medium text-surface-950 dark:text-surface-0">{{ description }}</p>
        </div>
    </div>
</template>
