<script setup>
import { buildColumnarData, fetchTagHistory, TAG_COLORS } from '@/service/seguimientoService';
import { Chart, registerables } from 'chart.js';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

Chart.register(...registerables);

// ── Props ─────────────────────────────────────────────────────────────────────
const props = defineProps({
    tags:        { type: Array,  default: () => [] },
    range:       { type: String, default: '8h' },
    calcVars:    { type: Array,  default: () => [] },
    operMetrics: { type: Array,  default: () => [] },
});
const emit = defineEmits(['remove-tag', 'remove-metric']);

// ── Canvas refs ───────────────────────────────────────────────────────────────
const canvasRef     = ref(null);
const operCanvasRef = ref(null);
let chart     = null;
let operChart = null;

// ── Datos del chart ───────────────────────────────────────────────────────────
const allTags  = computed(() => [...props.tags, ...props.calcVars]);
const chartData = computed(() => buildColumnarData(allTags.value, props.range));

// ── Color / posición de eje ───────────────────────────────────────────────────
function tagColor(i) { return TAG_COLORS[i % TAG_COLORS.length].border; }

// ── Crear / recrear chart principal ──────────────────────────────────────────
function createChart() {
    if (chart) { chart.destroy(); chart = null; }
    if (!canvasRef.value || !allTags.value.length) return;

    const labels   = chartData.value.map(d => d.time);
    const datasets = allTags.value.map((tag, i) => ({
        label:           tag.tag || tag.key,
        data:            chartData.value.map(d => d[tag.key] ?? null),
        borderColor:     tagColor(i),
        backgroundColor: 'transparent',
        yAxisID:         `y${i}`,
        tension:         0.3,
        pointRadius:     0,
        borderWidth:     2,
        spanGaps:        true,
    }));

    const scales = {
        x: {
            ticks: { font: { size: 10 }, maxTicksLimit: 10, color: '#888' },
            grid:  { color: 'rgba(128,128,128,0.08)' },
        },
    };
    allTags.value.forEach((tag, i) => {
        const color = tagColor(i);
        scales[`y${i}`] = {
            type:     'linear',
            position: i % 2 === 0 ? 'left' : 'right',
            ticks:    { color, font: { size: 10 }, maxTicksLimit: 6 },
            grid:     { display: i === 0, color: 'rgba(128,128,128,0.08)' },
        };
    });

    chart = new Chart(canvasRef.value, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive:          true,
            maintainAspectRatio: false,
            animation:           false,
            scales,
            plugins: {
                legend: {
                    display:  true,
                    position: 'top',
                    labels:   { font: { size: 11 }, boxWidth: 14, padding: 10 },
                },
                tooltip: {
                    mode:      'index',
                    intersect: false,
                    callbacks: {
                        label(ctx) {
                            const tag  = allTags.value[ctx.datasetIndex];
                            const unit = tag?.unidad ?? '';
                            const val  = ctx.parsed.y;
                            return `${ctx.dataset.label}: ${val !== null ? val.toFixed(2) : '—'} ${unit}`;
                        },
                    },
                },
            },
            interaction: { mode: 'index', intersect: false },
        },
    });
}

// ── Estadísticas para la tabla inferior ──────────────────────────────────────
const gridData = computed(() => {
    return allTags.value.map((tag, i) => {
        const hist   = fetchTagHistory(tag, props.range);
        const vals   = hist.values;
        const last   = vals[vals.length - 1];
        const minVal = Math.min(...vals);
        const maxVal = Math.max(...vals);
        const avgVal = vals.reduce((a, b) => a + b, 0) / vals.length;
        const alarma = last >= (tag.alarmaHi ?? Infinity) || last <= (tag.alarmaLo ?? -Infinity);
        return {
            colorDot: tagColor(i),
            tag:      tag.tag,
            desc:     tag.desc || tag.nombre || tag.key,
            unidad:   tag.unidad || '',
            last:     last.toFixed(2),
            min:      minVal.toFixed(2),
            max:      maxVal.toFixed(2),
            avg:      avgVal.toFixed(2),
            tipo:     tag.tipo || 'Calc',
            alarmaHi: tag.alarmaHi ?? '—',
            alarmaLo: tag.alarmaLo ?? '—',
            calidad:  alarma ? 'Alarma' : 'Buena',
        };
    });
});

// ── Datos de operaciones ──────────────────────────────────────────────────────
const OPER_COLORS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#ec4899'];

function operColor(m) {
    const i = props.operMetrics.indexOf(m);
    return OPER_COLORS[i % OPER_COLORS.length];
}

const operChartData = computed(() => {
    if (!props.operMetrics.length) return [];
    const dateSet = new Set();
    props.operMetrics.forEach(m => (m.series || []).forEach(p => dateSet.add(p.fecha)));
    const dates = Array.from(dateSet).sort();
    return dates.map(date => {
        const row = { time: date };
        props.operMetrics.forEach(m => {
            const pt = (m.series || []).find(p => p.fecha === date);
            if (pt) row[m.key] = pt.valor;
        });
        return row;
    });
});

function createOperChart() {
    if (operChart) { operChart.destroy(); operChart = null; }
    if (!operCanvasRef.value || !props.operMetrics.length) return;

    const labels   = operChartData.value.map(d => d.time);
    const datasets = props.operMetrics.map((m, i) => ({
        label:           m.label,
        data:            operChartData.value.map(d => d[m.key] ?? null),
        borderColor:     operColor(m),
        backgroundColor: 'transparent',
        yAxisID:         `oy${i}`,
        tension:         0.3,
        pointRadius:     2,
        borderWidth:     2,
        spanGaps:        true,
    }));

    const scales = {
        x: {
            ticks: { font: { size: 10 }, maxTicksLimit: 8, color: '#888' },
            grid:  { color: 'rgba(128,128,128,0.08)' },
        },
    };
    props.operMetrics.forEach((m, i) => {
        const color = operColor(m);
        scales[`oy${i}`] = {
            type:     'linear',
            position: i % 2 === 0 ? 'left' : 'right',
            ticks:    { color, font: { size: 10 }, maxTicksLimit: 5 },
            grid:     { display: i === 0, color: 'rgba(128,128,128,0.08)' },
            title:    m.unidad ? { display: true, text: m.unidad, color, font: { size: 9 } } : undefined,
        };
    });

    operChart = new Chart(operCanvasRef.value, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive:          true,
            maintainAspectRatio: false,
            animation:           false,
            scales,
            plugins: {
                legend: {
                    display:  true,
                    position: 'top',
                    labels:   { font: { size: 11 }, boxWidth: 14, padding: 10 },
                },
                tooltip: { mode: 'index', intersect: false },
            },
            interaction: { mode: 'index', intersect: false },
        },
    });
}

// ── Watchers ──────────────────────────────────────────────────────────────────
watch(chartData, () => {
    nextTick(() => createChart());
});

watch(() => props.operMetrics, () => {
    nextTick(() => createOperChart());
}, { deep: true });

onMounted(() => {
    createChart();
    createOperChart();
});

onUnmounted(() => {
    chart?.destroy();
    operChart?.destroy();
});
</script>

<template>
    <div class="ta-root flex flex-column h-full">

        <!-- Sin tags ni métricas ────────────────────────────────────────── -->
        <div v-if="!allTags.length && !props.operMetrics.length" class="ta-empty">
            <i class="pi pi-wave-pulse ta-empty-icon" />
            <p class="ta-empty-title">Sin variables seleccionadas</p>
            <p class="ta-empty-sub">
                Doble clic en un tag de proceso, o arrastra una métrica de
                Producción / Compras / Ventas desde el árbol de operaciones
            </p>
        </div>

        <!-- Chart + tabla ───────────────────────────────────────────────── -->
        <template v-if="allTags.length">

            <!-- ── CHART PRINCIPAL ──────────────────────────────────────── -->
            <div class="ta-chart-area flex-1">
                <canvas ref="canvasRef" style="width:100%;height:100%" />
            </div>

            <!-- ── TABLA DE VARIABLES ───────────────────────────────────── -->
            <div class="ta-grid">
                <table class="ta-table">
                    <thead>
                        <tr>
                            <th style="width:20px"></th>
                            <th>Tag</th>
                            <th>Descripción</th>
                            <th>Unidad</th>
                            <th>Actual</th>
                            <th>Mín</th>
                            <th>Máx</th>
                            <th>Prom</th>
                            <th>Tipo</th>
                            <th>Al. Hi</th>
                            <th>Al. Lo</th>
                            <th>Calidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in gridData" :key="row.tag">
                            <td><span class="ta-dot" :style="`background:${row.colorDot}`" /></td>
                            <td class="ta-mono">{{ row.tag }}</td>
                            <td class="ta-desc">{{ row.desc }}</td>
                            <td>{{ row.unidad }}</td>
                            <td class="ta-val">{{ row.last }}</td>
                            <td>{{ row.min }}</td>
                            <td>{{ row.max }}</td>
                            <td>{{ row.avg }}</td>
                            <td>{{ row.tipo }}</td>
                            <td>{{ row.alarmaHi }}</td>
                            <td>{{ row.alarmaLo }}</td>
                            <td>
                                <span :class="`ta-qual ta-qual-${row.calidad === 'Alarma' ? 'alarm' : 'ok'}`">
                                    {{ row.calidad }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

        <!-- ══════════════════════════════════════════════════════════════
             PANEL DE MÉTRICAS OPERATIVAS (Producción / Compras / Ventas)
        ══════════════════════════════════════════════════════════════ -->
        <template v-if="props.operMetrics.length">

            <!-- Cabecera ─────────────────────────────────────────────────── -->
            <div class="ta-oper-header">
                <i class="pi pi-chart-bar" />
                <span>Métricas Operativas</span>
                <span class="ta-oper-count">{{ props.operMetrics.length }}</span>
                <div class="ta-oper-chips">
                    <span v-for="m in props.operMetrics" :key="m.key"
                          class="ta-oper-chip"
                          :style="`border-color:${operColor(m)};color:${operColor(m)}`">
                        {{ m.label }}
                        <span v-if="m.unidad" class="ta-oper-chip-unit">{{ m.unidad }}</span>
                        <button class="ta-oper-chip-del" @click="emit('remove-metric', m.key)">×</button>
                    </span>
                </div>
            </div>

            <!-- Chart de operaciones ─────────────────────────────────────── -->
            <div class="ta-oper-chart">
                <canvas ref="operCanvasRef" style="width:100%;height:100%" />
            </div>

        </template>

    </div>
</template>

<style scoped>
.ta-root { overflow: hidden; background: var(--p-surface-0); }

/* ── Vacío ─────────────────────────────────────────────────────────────────── */
.ta-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; gap: 10px; color: var(--p-text-muted-color); padding: 2rem;
}
.ta-empty-icon  { font-size: 4rem; opacity: 0.12; }
.ta-empty-title { font-size: 1rem; font-weight: 600; margin: 0; }
.ta-empty-sub   { font-size: 0.8rem; margin: 0; text-align: center; }

/* ── Chart ─────────────────────────────────────────────────────────────────── */
.ta-chart-area { min-height: 0; overflow: hidden; position: relative; }

/* ── Tabla ─────────────────────────────────────────────────────────────────── */
.ta-grid {
    height: 130px; overflow-y: auto;
    border-top: 1px solid var(--p-surface-200);
}
.ta-table {
    width: 100%; border-collapse: collapse;
    font-size: 0.72rem;
}
.ta-table th {
    position: sticky; top: 0; z-index: 1;
    background: var(--p-surface-100);
    border-bottom: 1px solid var(--p-surface-300);
    padding: 3px 6px; text-align: left; font-weight: 600;
    color: var(--p-text-muted-color); white-space: nowrap;
}
.ta-table td {
    padding: 2px 6px; border-bottom: 1px solid var(--p-surface-100);
    white-space: nowrap;
}
.ta-table tr:nth-child(even) td { background: var(--p-surface-50); }

.ta-dot {
    display: block; width: 10px; height: 10px;
    border-radius: 50%; margin: auto;
}
.ta-mono { font-family: monospace; font-weight: 600; }
.ta-val  { font-weight: 700; }
.ta-desc { max-width: 180px; overflow: hidden; text-overflow: ellipsis; }

.ta-qual {
    display: inline-block; padding: 1px 6px; border-radius: 3px;
    font-size: 0.65rem; font-weight: 600;
}
.ta-qual-ok    { background: #dcfce7; color: #15803d; }
.ta-qual-alarm { background: #fee2e2; color: #b91c1c; }

/* ── Panel de métricas operativas ──────────────────────────────────────────── */
.ta-oper-header {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    padding: 4px 10px; border-top: 2px solid var(--p-primary-color);
    background: var(--p-surface-100); font-size: 0.72rem; font-weight: 700;
    color: var(--p-primary-color);
}
.ta-oper-count {
    background: var(--p-primary-color); color: #fff;
    border-radius: 10px; font-size: 0.6rem; padding: 1px 6px;
}
.ta-oper-chips { display: flex; gap: 5px; flex-wrap: wrap; margin-left: 4px; }
.ta-oper-chip {
    display: flex; align-items: center; gap: 4px;
    border: 1px solid; border-radius: 12px;
    padding: 1px 8px; font-size: 0.67rem; font-weight: 600;
    background: var(--p-surface-0);
}
.ta-oper-chip-unit {
    background: var(--p-surface-200); border-radius: 4px;
    padding: 0 4px; font-size: 0.6rem; color: var(--p-text-muted-color);
}
.ta-oper-chip-del {
    background: none; border: none; cursor: pointer;
    font-size: 0.9rem; line-height: 1; color: inherit; opacity: 0.6; padding: 0;
}
.ta-oper-chip-del:hover { opacity: 1; }
.ta-oper-chart { height: 220px; border-top: 1px solid var(--p-surface-200); position: relative; }
</style>
