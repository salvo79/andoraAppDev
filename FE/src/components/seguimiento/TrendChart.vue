<script setup>
import { fetchTagHistory, TAG_COLORS } from '@/service/seguimientoService';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
    tagData:    { type: Object, required: true },   // { key, tag, desc, unidad, min, max, tipo, alarmaHi, alarmaLo }
    range:      { type: String,  default: '8h' },
    colorIndex: { type: Number,  default: 0 },
});

const emit = defineEmits(['remove']);

// ── Datos ─────────────────────────────────────────────────────────────────────
const histData = ref(null);
const color    = computed(() => TAG_COLORS[props.colorIndex % TAG_COLORS.length]);

function load() {
    histData.value = fetchTagHistory(props.tagData, props.range);
}

onMounted(load);
watch(() => [props.range, props.tagData.key], load);

// ── Calidad / estado ──────────────────────────────────────────────────────────
const quality = computed(() => {
    if (!histData.value) return 'secondary';
    const v = histData.value.lastValue;
    if (v >= props.tagData.alarmaHi || v <= props.tagData.alarmaLo) return 'danger';
    const margin = (props.tagData.alarmaHi - props.tagData.alarmaLo) * 0.1;
    if (v >= props.tagData.alarmaHi - margin || v <= props.tagData.alarmaLo + margin) return 'warn';
    return 'success';
});

const qualityLabel = computed(() => ({
    success: 'Buena', warn: 'Advertencia', danger: 'Alarma', secondary: '—'
}[quality.value]));

// ── Chart.js config ───────────────────────────────────────────────────────────
const chartData = computed(() => {
    if (!histData.value) return null;
    return {
        labels: histData.value.labels,
        datasets: [
            {
                label: props.tagData.tag,
                data: histData.value.values,
                borderColor: color.value.border,
                backgroundColor: color.value.bg,
                borderWidth: 1.5,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.35,
                fill: true,
            },
            // Línea de alarma alta
            {
                label: 'Hi',
                data: Array(histData.value.labels.length).fill(props.tagData.alarmaHi),
                borderColor: 'rgba(239,68,68,0.5)',
                borderDash: [4, 4],
                borderWidth: 1,
                pointRadius: 0,
                fill: false,
                tension: 0,
            },
            // Línea de alarma baja
            {
                label: 'Lo',
                data: Array(histData.value.labels.length).fill(props.tagData.alarmaLo),
                borderColor: 'rgba(234,179,8,0.5)',
                borderDash: [4, 4],
                borderWidth: 1,
                pointRadius: 0,
                fill: false,
                tension: 0,
            },
        ],
    };
});

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: ctx => {
                    if (ctx.datasetIndex > 0) return null;
                    return `${ctx.parsed.y.toFixed(2)} ${props.tagData.unidad}`;
                },
            },
        },
    },
    scales: {
        x: {
            ticks: {
                maxTicksLimit: 8,
                font: { size: 10 },
                color: '#94a3b8',
            },
            grid: { color: 'rgba(148,163,184,0.1)' },
        },
        y: {
            min: props.tagData.min,
            max: props.tagData.max,
            ticks: {
                font: { size: 10 },
                color: '#94a3b8',
                callback: v => `${v}`,
            },
            grid: { color: 'rgba(148,163,184,0.1)' },
        },
    },
}));

// ── Indicadores estadísticos ──────────────────────────────────────────────────
const stats = computed(() => {
    if (!histData.value) return null;
    const v = histData.value.values;
    const mn  = Math.min(...v);
    const mx  = Math.max(...v);
    const avg = v.reduce((a, b) => a + b, 0) / v.length;
    return {
        min:  mn.toFixed(2),
        max:  mx.toFixed(2),
        avg:  avg.toFixed(2),
        last: histData.value.lastValue.toFixed(2),
        ts:   histData.value.timestamp,
    };
});
</script>

<template>
    <div class="card mb-3 p-0 overflow-hidden border-1"
         :style="`border-color: ${color.border}30`">

        <!-- Cabecera ──────────────────────────────────────────────────────── -->
        <div class="flex align-items-center gap-2 px-3 py-2"
             :style="`border-left: 4px solid ${color.border}; background: ${color.bg}`">

            <!-- Tag name + desc -->
            <div class="flex-1 min-w-0">
                <span class="font-bold text-sm mr-2" :style="`color: ${color.border}`">
                    {{ tagData.tag }}
                </span>
                <span class="text-color-secondary text-xs">{{ tagData.desc }}</span>
            </div>

            <!-- Valor actual -->
            <div v-if="stats" class="flex align-items-center gap-2">
                <span class="text-xl font-bold" :style="`color: ${color.border}`">
                    {{ stats.last }}
                </span>
                <span class="text-sm text-color-secondary">{{ tagData.unidad }}</span>
                <Tag :value="qualityLabel" :severity="quality" style="font-size:0.7rem" />
            </div>

            <!-- Cerrar -->
            <Button icon="pi pi-times" text rounded size="small" severity="secondary"
                    @click="emit('remove', tagData.key)" />
        </div>

        <!-- Stats rápidos ─────────────────────────────────────────────────── -->
        <div v-if="stats" class="flex gap-4 px-3 py-1 surface-50">
            <span class="text-xs text-color-secondary">
                Mín <strong>{{ stats.min }}</strong>
            </span>
            <span class="text-xs text-color-secondary">
                Máx <strong>{{ stats.max }}</strong>
            </span>
            <span class="text-xs text-color-secondary">
                Prom <strong>{{ stats.avg }}</strong>
            </span>
            <span class="text-xs text-color-secondary ml-auto">
                <i class="pi pi-clock mr-1" />{{ stats.ts }}
            </span>
        </div>

        <!-- Gráfica ───────────────────────────────────────────────────────── -->
        <div class="px-2 py-2" style="height: 160px">
            <Chart
                v-if="chartData"
                type="line"
                :data="chartData"
                :options="chartOptions"
                style="height: 100%"
            />
            <div v-else class="flex align-items-center justify-content-center h-full">
                <ProgressSpinner style="width:32px;height:32px" />
            </div>
        </div>
    </div>
</template>
