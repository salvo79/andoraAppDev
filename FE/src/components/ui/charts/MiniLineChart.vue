<script setup>
import { useLayout } from '@/layout/composables/layout';

import { ref, watch } from 'vue';

const props = defineProps({
    className: {
        type: String,
        default: ''
    },
    data: {
        type: Array,
        required: true
    },
    bgColor: {
        type: Array,
        default: null
    },
    borderColor: {
        type: String,
        default: null
    }
});

const plugins = ref([]);
const chartData = ref({});
const chartOptions = ref({});
const { isDarkTheme } = useLayout();

watch(
    () => isDarkTheme.value,
    () => {
        chartData.value = setChartData();
        chartOptions.value = setChartOptions(props.tooltipPrefix);
        plugins.value = setLineChartPlugins();
    },
    { immediate: true }
);

function setLineChartPlugins() {
    return [];
}

function setChartData() {
    const darkMode = isDarkTheme.value ?? false;

    return {
        labels: Array(props.data.length)
            .fill(null)
            .map((_, i) => i),
        datasets: [
            {
                label: 'Dataset',
                data: props.data,
                fill: true,
                borderColor: props.borderColor ?? (darkMode ? '#FAFAFA' : '#030616'),
                tension: 0.3,
                borderWidth: 1.2,
                pointBorderWidth: 0,
                pointStyle: false,
                hideInLegendAndTooltip: false,
                pointRadius: 0,
                backgroundColor: (context) => {
                    const defaultColor = [darkMode ? 'rgba(255, 255, 255, 0.24)' : 'rgba(3, 6, 22, 0.24)', darkMode ? 'rgba(255, 255, 255, 0)' : 'rgba(3, 6, 22, 0)'];
                    const bg = props.bgColor ?? defaultColor;

                    if (!context.chart.chartArea) {
                        return;
                    }

                    const {
                        ctx,
                        chartArea: { top, bottom }
                    } = context.chart;
                    const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                    const colorTranches = 1 / (bg.length - 1);

                    bg.forEach((color, index) => {
                        gradientBg.addColorStop(index * colorTranches, color);
                    });

                    return gradientBg;
                }
            }
        ]
    };
}

function setChartOptions() {
    return {
        interaction: {
            intersect: false,
            mode: 'index'
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                enabled: false
            },
            legend: {
                display: false
            },
            title: {
                display: false
            }
        },
        scales: {
            x: {
                display: false,
                stacked: true
            },
            y: {
                display: false,
                min: 0
            }
        }
    };
}
</script>

<template>
    <Chart type="line" :data="chartData" :plugins="plugins" :options="chartOptions" :class="className" />
</template>
