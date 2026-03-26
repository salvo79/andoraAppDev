<script setup>
import { useLayout } from '@/layout/composables/layout';
import { sampleDataByFixedLength } from '@/lib/utils';
import 'chartjs-adapter-date-fns';
import { ref, watch } from 'vue';

const props = defineProps({
    className: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: 'Label'
    },
    dataset: {
        type: Array,
        default: () => []
    },
    show: {
        type: Number,
        default: 12
    },
    option: {
        type: String,
        default: 'month'
    },
    tooltipPrefix: {
        type: String
    },
    stepSize: {
        type: Number,
        default: 2000
    }
});

const data = ref(null);
const chartPlugins = ref([]);
const chartData = ref({});
const chartOptions = ref({});
const chartColors = ref({});
const { layoutConfig, isDarkTheme } = useLayout();

function setChartPlugins() {
    return [];
}

function setChartColors() {
    const rootStyles = getComputedStyle(document.documentElement);
    chartColors.value = {
        surface100: rootStyles.getPropertyValue('--p-surface-100'),
        surface200: rootStyles.getPropertyValue('--p-surface-200'),
        surface400: rootStyles.getPropertyValue('--p-surface-400'),
        surface500: rootStyles.getPropertyValue('--p-surface-500'),
        surface700: rootStyles.getPropertyValue('--p-surface-700'),
        surface900: rootStyles.getPropertyValue('--p-surface-900')
    };
}

function setChartData(option) {
    const sampledData = sampleDataByFixedLength(props.dataset, option, props.show);
    if (sampledData.length <= 0) {
        data.value = [];
        return;
    }
    const rootStyles = getComputedStyle(document.documentElement);
    const primary = rootStyles.getPropertyValue('--p-primary-color');
    const primary600 = rootStyles.getPropertyValue('--p-primary-600');

    if (sampledData[sampledData.length - 1].x === undefined) {
        const lastValidDate = sampledData[sampledData.length - 2].x;
        const interval = getIntervalFromOption(option);
        sampledData[sampledData.length - 1].x = addInterval(lastValidDate, interval);
    }
    data.value = sampledData;
    return {
        datasets: [
            {
                label: props.label ?? 'dataset',
                data: sampledData,
                fill: true,
                backgroundColor: primary,
                hoverBackgroundColor: primary600,
                hideInLegendAndTooltip: false,
                barThickness: 24,
                borderRadius: {
                    topLeft: 4,
                    topRight: 4,
                    bottomLeft: 0,
                    bottomRight: 0
                }
            }
        ]
    };
}

function getIntervalFromOption(option) {
    switch (option) {
        case 'week':
            return { weeks: 1 };
        case 'month':
            return { months: 1 };
        case 'quarter':
            return { months: 3 };
        case 'year':
            return { years: 1 };
        default:
            return { days: 1 };
    }
}

function addInterval(date, interval) {
    return new Date(date.getFullYear() + (interval.years || 0), date.getMonth() + (interval.months || 0), date.getDate() + (interval.days || 0) + (interval.weeks ? interval.weeks * 7 : 0));
}

function setChartOptions(tooltipPrefix) {
    const rootStyles = getComputedStyle(document.documentElement);
    const surface200 = rootStyles.getPropertyValue('--p-surface-200');
    const surface400 = rootStyles.getPropertyValue('--p-surface-400');

    const endDate = new Date(data.value[data.value.length - 1].x);
    const startDate = new Date(data.value[0].x);
    return {
        interaction: {
            intersect: false,
            mode: 'index'
        },
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: 0
        },
        plugins: {
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
                    const datasetPointsX = tooltip.dataPoints.map((dp) => dp.element.x);
                    const avgX = datasetPointsX.reduce((a, b) => a + b, 0) / datasetPointsX.length;
                    const avgY = tooltip.dataPoints[0].element.y;

                    if (tooltip.body) {
                        tooltipEl.innerHTML = '';
                        const tooltipHeader = document.createElement('div');
                        tooltipHeader.classList.add('bg-surface-100', 'dark:bg-surface-900', 'px-3', 'py-2.5', 'border-b', 'border-surface', 'text-left', 'label-xsmall');
                        tooltipHeader.appendChild(document.createTextNode(tooltip.title[0]));
                        tooltipEl.appendChild(tooltipHeader);
                        const tooltipBody = document.createElement('div');
                        tooltipBody.classList.add('flex', 'flex-col', 'gap-2', 'px-3', 'py-2', 'min-w-[12.5rem]');
                        tooltip.dataPoints.reverse().forEach((body) => {
                            const row = document.createElement('div');
                            row.classList.add('flex', 'items-center', 'gap-2', 'w-full');
                            const point = document.createElement('div');
                            point.classList.add('w-2.5', 'h-2.5', 'rounded-full');
                            point.style.backgroundColor = body.dataset.backgroundColor;
                            row.appendChild(point);
                            const label = document.createElement('span');
                            label.appendChild(document.createTextNode(body.dataset.label));
                            label.classList.add('text-base', 'text-surface-950', 'dark:text-surface-0', 'flex-1', 'text-left', 'capitalize');
                            row.appendChild(label);
                            const value = document.createElement('span');
                            value.appendChild(document.createTextNode(tooltipPrefix + body.formattedValue));
                            value.classList.add('text-base', 'text-surface-950', 'dark:text-surface-0', 'text-right');
                            row.appendChild(value);
                            tooltipBody.appendChild(row);
                        });
                        tooltipEl.appendChild(tooltipBody);
                    }

                    const { offsetLeft: positionX } = chart.canvas;

                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.font = tooltip.options.bodyFont.string;
                    tooltipEl.style.padding = 0;
                    const chartWidth = chart.width;
                    const tooltipWidth = tooltipEl.offsetWidth;
                    const chartHeight = chart.height;
                    const tooltipHeight = tooltipEl.offsetHeight;

                    let tooltipX = positionX + avgX + 20;
                    let tooltipY = avgY;

                    if (tooltipX + tooltipWidth > chartWidth) {
                        tooltipX = positionX + avgX - tooltipWidth - 20;
                    }

                    if (tooltipY < 0) {
                        tooltipY = 0;
                    } else if (tooltipY + tooltipHeight > chartHeight) {
                        tooltipY = chartHeight - tooltipHeight;
                    }

                    tooltipEl.style.left = tooltipX + 'px';
                    tooltipEl.style.top = tooltipY + 'px';
                }
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
                stacked: true,
                type: 'time',
                time: {
                    unit: props.option,
                    tooltipFormat: 'MM/dd/yyyy HH:mm',
                    displayFormats: {
                        week: 'MMM d, yyyy',
                        month: 'MMM yyyy',
                        quarter: 'QQQ yyyy',
                        year: 'yyyy'
                    }
                },
                min: startDate,
                max: endDate,
                offset: true,
                grid: {
                    display: false
                },
                ticks: {
                    color: isDarkTheme.value ? 'rgba(255, 255, 255, 0.40)' : surface400,
                    autoSkip: true,
                    maxRotation: 0,
                    source: 'data'
                },
                border: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                display: true,
                stacked: true,
                min: 0,
                grid: {
                    display: true,
                    color: isDarkTheme.value ? 'rgba(255, 255, 255, 0.08)' : surface200,
                    tickBorderDash: [2, 2]
                },
                border: {
                    dash: [8, 4],
                    dashOffset: 6,
                    display: false
                },
                ticks: {
                    maxTicksLimit: 6,
                    color: isDarkTheme.value ? 'rgba(255, 255, 255, 0.40)' : surface400,
                    stepSize: props.stepSize,
                    callback: function (value) {
                        if (value > 1000) {
                            return value / 1000 + 'K';
                        }
                        return value;
                    }
                }
            }
        }
    };
}

function redrawChart() {
    setChartColors();
    chartData.value = setChartData(props.option);
    chartOptions.value = setChartOptions(props.tooltipPrefix);
    chartPlugins.value = setChartPlugins();
}

watch(
    [() => props.option, () => isDarkTheme.value],
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
    <Chart type="bar" :data="chartData" :plugins="chartPlugins" :options="chartOptions" :class="className" class="h-full w-full cursor-pointer min-w-[640px] max-h-80" />
</template>
