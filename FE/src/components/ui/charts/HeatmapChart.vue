<script setup>
import { useLayout } from '@/layout/composables/layout';
import { Chart as ChartJS, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { ref, watch } from 'vue';

ChartJS.register(...registerables, MatrixController, MatrixElement);
const props = defineProps({
    label: {
        type: String,
        default: 'Label'
    },
    dataset: {
        type: Array,
        default: () => []
    },
    conditions: {
        type: Array,
        required: true
    }
});

const chartPlugins = ref([]);
const chartData = ref({});
const chartOptions = ref({});
const { layoutConfig, isDarkTheme } = useLayout();

function setChartPlugins() {
    return [];
}

function setChartData() {
    return {
        datasets: [
            {
                label: props.label ?? 'dataset',
                data: props.dataset,
                backgroundColor(c) {
                    const rootStyles = getComputedStyle(document.documentElement);
                    const value = c.dataset.data[c.dataIndex].v;

                    const conditions = props.conditions;

                    let backgroundColor = '--p-surface-800';

                    for (const condition of conditions) {
                        if (value >= condition.min && value <= condition.max) {
                            backgroundColor = condition.color[isDarkTheme.value ? 'dark' : 'light'];
                            break;
                        }
                    }
                    return rootStyles.getPropertyValue(backgroundColor);
                },
                hoverBackgroundColor: undefined,
                hoverBorderColor: undefined,
                borderRadius: 4,
                borderWidth: 0,
                width(c) {
                    const a = c.chart.chartArea || {};
                    return (a.right - a.left) / 14 - 1;
                },
                height(c) {
                    const a = c.chart.chartArea || {};
                    return (a.bottom - a.top) / 9 - 1;
                }
            }
        ]
    };
}

function setChartOptions() {
    const rootStyles = getComputedStyle(document.documentElement);
    const surface400 = rootStyles.getPropertyValue('--p-surface-400');

    return {
        animation: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: 0
        },
        events: [],
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            }
        },
        scales: {
            x: {
                type: 'time',
                offset: true,
                time: {
                    unit: 'week',
                    round: 'week',
                    isoWeekDay: 1,
                    displayFormats: {
                        week: 'MMM dd'
                    }
                },
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    font: {
                        size: 12
                    },
                    color: isDarkTheme.value ? 'rgba(255,255,255,0.64)' : surface400
                },
                grid: {
                    display: false,
                    drawBorder: false,
                    tickLength: 0
                },
                border: {
                    display: false
                }
            },
            y: {
                type: 'time',
                offset: true,
                time: {
                    unit: 'day',
                    round: 'day',
                    isoWeek: 1,
                    parser: 'i',
                    displayFormats: {
                        day: 'iii'
                    }
                },
                reverse: true,
                position: 'right',
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    padding: 1,
                    font: {
                        size: 12,
                        weight: 500
                    },
                    color: isDarkTheme.value ? 'rgba(255,255,255,0.64)' : surface400
                },
                border: {
                    display: false
                },
                grid: {
                    display: false,
                    drawBorder: false,
                    tickLength: 0
                }
            }
        }
    };
}

function redrawChart() {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
    chartPlugins.value = setChartPlugins();
}

watch(
    [() => isDarkTheme.value],
    () => {
        redrawChart();
    },
    { immediate: true }
);

watch(
    [() => layoutConfig.surface, () => layoutConfig.primary],
    () => {
        redrawChart();
    },
    { immediate: true }
);
</script>

<template>
    <Chart type="matrix" :data="chartData" :plugins="chartPlugins" :options="chartOptions" class="h-full w-full cursor-pointer max-w-full min-h-80" />
</template>
