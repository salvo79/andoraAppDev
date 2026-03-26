<script setup>
import { useLayout } from '@/layout/composables/layout';
import { sampleDataReductionByArray } from '@/lib/utils';
import 'chartjs-adapter-date-fns';
import { ref, watch } from 'vue';

const props = defineProps({
    className: {
        type: String,
        default: ''
    },
    labels: {
        type: Array,
        default: () => []
    },
    datasets: {
        type: Array,
        default: () => []
    },
    bgColors: {
        type: Array,
        default: null
    },
    borderColors: {
        type: Array,
        default: null
    },
    show: {
        type: Number,
        default: 12
    },
    tooltipPrefix: {
        type: String,
        default: '$'
    },
    option: {
        type: String,
        default: 'month'
    },
    stepSize: {
        type: Number,
        default: 2000
    },
    dataReduction: {
        type: Boolean,
        default: true
    }
});

const data = ref(null);
const plugins = ref([]);
const chartData = ref({});
const chartOptions = ref({});
const { isDarkTheme, layoutConfig } = useLayout();
const chart = ref(null);
watch(
    [() => props.option, () => isDarkTheme.value, () => layoutConfig.primary],
    ([newOptionVal]) => {
        chartData.value = setChartData(newOptionVal);
        chartOptions.value = setChartOptions(props.tooltipPrefix);
        plugins.value = setChartPlugins();
    },
    { immediate: true }
);

function setChartData(option) {
    const sampledData = props.dataReduction ? sampleDataReductionByArray(props.datasets, option, props.show) : props.datasets;
    if (sampledData.length <= 0) {
        data.value = [];
        return {
            datasets: null
        };
    }
    const darkMode = isDarkTheme.value ?? false;
    const rootStyles = getComputedStyle(document.documentElement);
    const surface0Color = rootStyles.getPropertyValue('--p-surface-0');
    const surface950Color = rootStyles.getPropertyValue('--p-surface-950');

    const lineCount = sampledData[0].y.length;
    const dataArr = Array(lineCount)
        .fill(null)
        .map((_, index) => {
            return {
                label: props.labels[index] ?? 'dataset' + index,
                data: [],
                fill: true,
                borderColor: props.borderColors?.[index] ?? (darkMode ? '#FAFAFA' : '#030616'),
                tension: 0.36,
                borderWidth: 1.2,
                pointBorderColor: 'rgba(0, 0, 0, 0)',
                pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                pointHoverBackgroundColor: props.borderColors?.[index] ?? (darkMode ? surface0Color : surface950Color),
                pointHoverBorderColor: darkMode ? surface950Color : surface0Color,
                pointBorderWidth: 12,
                hideInLegendAndTooltip: false,
                pointStyle: 'circle',
                pointRadius: 4,
                backgroundColor: (context) => {
                    const defaultColor = [darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(3, 6, 22, 0.06)', darkMode ? 'rgba(255, 255, 255, 0)' : 'rgba(3, 6, 22, 0)'];
                    const bg = props.bgColors && props.bgColors[index] !== undefined ? props.bgColors[index] : defaultColor;

                    if (!context.chart.chartArea) {
                        return;
                    }

                    const {
                        ctx,
                        chartArea: { top, bottom }
                    } = context.chart;
                    const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                    const colorTranches = 1 / (bg.length - 1);

                    for (let i = 0; i < bg.length; i++) {
                        gradientBg.addColorStop(0 + i * colorTranches, bg[i]);
                    }

                    return gradientBg;
                }
            };
        });
    sampledData.forEach(({ x, y }) => {
        Array(lineCount)
            .fill(null)
            .forEach((_, i) => {
                dataArr[i].data.push({ x, y: y[i] });
            });
    });
    data.value = dataArr;
    return {
        datasets: dataArr
    };
}

function setChartPlugins() {
    const hoverLine = {
        id: 'hoverLine',
        beforeDatasetsDraw: (chart) => {
            const {
                ctx,
                tooltip,
                chartArea: { bottom },
                scales: { x }
            } = chart;
            if (tooltip && tooltip._active.length > 0) {
                const xCoor = x.getPixelForValue(tooltip.dataPoints[0].raw.x);
                ctx.save();
                ctx.beginPath();
                ctx.lineWidth = 1.2;
                const rootStyles = getComputedStyle(document.documentElement);
                const surface500Color = rootStyles.getPropertyValue('--p-surface-500');
                ctx.strokeStyle = surface500Color;
                ctx.setLineDash([4, 4]);
                ctx.moveTo(xCoor, 0);
                ctx.lineTo(xCoor, bottom + 8);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            }
        }
    };

    return [hoverLine];
}

function setChartOptions(tooltipPrefix) {
    const darkMode = isDarkTheme.value ?? false;
    const rootStyles = getComputedStyle(document.documentElement);
    const surface400Color = rootStyles.getPropertyValue('--p-surface-400');
    const surface200Color = rootStyles.getPropertyValue('--p-surface-200');

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

                    const datasetPointsY = tooltip.dataPoints.map((dp) => dp.element.y);
                    const avgY = datasetPointsY.reduce((a, b) => a + b, 0) / datasetPointsY.length;

                    if (tooltip.body) {
                        tooltipEl.innerHTML = '';
                        const tooltipHeader = document.createElement('div');
                        tooltipHeader.classList.add('bg-surface-100', 'dark:bg-surface-900', 'px-3', 'py-2.5', 'border-b', 'border-surface', 'text-left', 'label-xsmall');
                        tooltipHeader.appendChild(document.createTextNode(tooltip.title[0]));
                        tooltipEl.appendChild(tooltipHeader);
                        const tooltipBody = document.createElement('div');
                        tooltipBody.classList.add('flex', 'flex-col', 'gap-2', 'px-3', 'py-2', 'min-w-[12.5rem]');
                        tooltip.dataPoints.forEach((body) => {
                            const row = document.createElement('div');
                            row.classList.add('flex', 'items-center', 'gap-2', 'w-full');
                            const point = document.createElement('div');
                            point.classList.add('w-2.5', 'h-2.5', 'rounded-full');
                            point.style.backgroundColor = body.dataset.borderColor;
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

                    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.font = tooltip.options.bodyFont.string;
                    tooltipEl.style.padding = '0px';

                    const chartWidth = chart.width;
                    const tooltipWidth = tooltipEl.offsetWidth;
                    const chartHeight = chart.height;
                    const tooltipHeight = tooltipEl.offsetHeight;

                    let tooltipX = positionX + avgX + 20;
                    let tooltipY = positionY + avgY - tooltipHeight / 2;

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
                type: 'time',
                time: {
                    unit: props.option,
                    tooltipFormat: 'MM/dd/yyyy HH:mm'
                },
                min: startDate,
                max: endDate,
                offset: false,
                grid: {
                    display: true,
                    lineWidth: 1.2,
                    color: 'rgba(255,255,255,0)'
                },
                ticks: {
                    color: darkMode ? 'rgba(255, 255, 255, 0.40)' : surface400Color,
                    autoSkip: false,
                    maxRotation: 0,
                    source: 'auto'
                },
                border: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                display: true,
                min: 0,
                border: {
                    display: false
                },
                ticks: {
                    color: darkMode ? 'rgba(255, 255, 255, 0.40)' : surface400Color,
                    autoSkip: false,
                    maxRotation: 0,
                    source: 'auto',
                    stepSize: props.stepSize,
                    callback: function (value) {
                        if (value > 1000) {
                            return value / 1000 + 'K';
                        }
                        return value;
                    }
                },
                grid: {
                    display: true,
                    lineWidth: 1,
                    color: darkMode ? 'rgba(255, 255, 255, 0.08)' : surface200Color
                }
            }
        }
    };
}
</script>

<template>
    <Chart ref="chart" type="line" :data="chartData" :plugins="plugins" :options="chartOptions" class="w-full overflow-auto h-full cursor-pointer" :class="className" />
</template>
