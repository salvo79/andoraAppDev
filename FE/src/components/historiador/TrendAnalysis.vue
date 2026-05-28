<script setup>
import { buildColumnarData, fetchTagHistory, TAG_COLORS } from '@/service/seguimientoService';
import {
    DxArgumentAxis,
    DxChart,
    DxCommonSeriesSettings,
    DxCrosshair,
    DxExport,
    DxHorizontalLine,
    DxLegend,
    DxScrollBar,
    DxSeries,
    DxTooltip,
    DxValueAxis,
    DxZoomAndPan,
} from 'devextreme-vue/chart';
import {
    DxBehavior,
    DxChart as DxRsChart,
    DxRangeSelector,
    DxScale,
    DxSeries as DxRsSeries,
    DxSize as DxRsSize,
} from 'devextreme-vue/range-selector';
import {
    DxColumn,
    DxDataGrid,
    DxScrolling,
} from 'devextreme-vue/data-grid';
import { computed, ref, watch } from 'vue';

// ── Props ─────────────────────────────────────────────────────────────────────
const props = defineProps({
    tags:        { type: Array,  default: () => [] },
    range:       { type: String, default: '8h' },
    calcVars:    { type: Array,  default: () => [] },
    operMetrics: { type: Array,  default: () => [] }, // métricas de Producción/Compras/Ventas
});
const emit = defineEmits(['remove-tag', 'remove-metric']);

// ── Refs ──────────────────────────────────────────────────────────────────────
const chartRef = ref(null);
const rsValue  = ref(null); // rango del range selector

// ── Datos del chart (formato columnar) ───────────────────────────────────────
const allTags = computed(() => [...props.tags, ...props.calcVars]);

const chartData = computed(() => buildColumnarData(allTags.value, props.range));

// ── Color / posición de eje por tag ──────────────────────────────────────────
function tagColor(tag) {
    const i = allTags.value.indexOf(tag);
    return TAG_COLORS[i % TAG_COLORS.length].border;
}
function axisPos(tag) {
    const i = allTags.value.indexOf(tag);
    return i % 2 === 0 ? 'left' : 'right';
}

// ── Sincronización range selector → chart ────────────────────────────────────
function onRangeChanged(e) {
    if (!e.value?.length || !chartRef.value) return;
    try {
        chartRef.value.instance.zoomArgument(e.value[0], e.value[1]);
    } catch { /* ignorar si chart no listo */ }
}

// ── Tooltip compartido ────────────────────────────────────────────────────────
function customizeTooltip(arg) {
    const lines = (arg.points || [])
        .filter(p => p.seriesIndex !== undefined)
        .map(p => {
            const tag = allTags.value.find(t => t.tag === p.seriesName || t.key === p.seriesName);
            const unit = tag?.unidad ?? '';
            return `<span style="color:${p.series.getColor()};font-weight:600">${p.seriesName}</span>: ${Number(p.value).toFixed(2)} ${unit}`;
        });
    return {
        html: `<div style="font-size:0.72rem;line-height:1.6">${lines.join('<br/>')}</div>`,
    };
}

// ── Estadísticas y tabla inferior ────────────────────────────────────────────
const gridData = computed(() => {
    return allTags.value.map((tag, i) => {
        const hist    = fetchTagHistory(tag, props.range);
        const vals    = hist.values;
        const last    = vals[vals.length - 1];
        const minVal  = Math.min(...vals);
        const maxVal  = Math.max(...vals);
        const avgVal  = vals.reduce((a, b) => a + b, 0) / vals.length;
        const alarma  = last >= (tag.alarmaHi ?? Infinity) || last <= (tag.alarmaLo ?? -Infinity);
        return {
            colorDot:  TAG_COLORS[i % TAG_COLORS.length].border,
            tag:       tag.tag,
            desc:      tag.desc || tag.nombre || tag.key,
            unidad:    tag.unidad || '',
            last:      last.toFixed(2),
            min:       minVal.toFixed(2),
            max:       maxVal.toFixed(2),
            avg:       avgVal.toFixed(2),
            tipo:      tag.tipo || 'Calc',
            alarmaHi:  tag.alarmaHi ?? '—',
            alarmaLo:  tag.alarmaLo ?? '—',
            calidad:   alarma ? 'Alarma' : 'Buena',
        };
    });
});

// Reset range selector cuando cambia el rango seleccionado
watch(() => props.range, () => { rsValue.value = null; });

// ── Datos columnar para el chart de operaciones ───────────────────────────────
const operChartData = computed(() => {
    if (!props.operMetrics.length) return [];
    const dateSet = new Set();
    props.operMetrics.forEach(m => (m.series || []).forEach(p => dateSet.add(p.fecha)));
    const dates = Array.from(dateSet).sort();
    return dates.map(date => {
        const row = { time: date };
        props.operMetrics.forEach(m => {
            const point = (m.series || []).find(p => p.fecha === date);
            if (point) row[m.key] = point.valor;
        });
        return row;
    });
});

function operColor(m) {
    const OPER_COLORS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#ec4899'];
    const i = props.operMetrics.indexOf(m);
    return OPER_COLORS[i % OPER_COLORS.length];
}
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

        <!-- Chart + navigator + tabla ───────────────────────────────────── -->
        <template v-else>

            <!-- ── CHART PRINCIPAL ──────────────────────────────────────── -->
            <div class="ta-chart-area flex-1">
                <DxChart
                    ref="chartRef"
                    :data-source="chartData"
                    argument-field="time"
                    :palette="TAG_COLORS.map(c => c.border)"
                    style="height:100%;width:100%"
                    @initialized="e => chartRef = e.component"
                >
                    <DxCommonSeriesSettings type="spline" :width="2" />

                    <!-- Series dinámicas -->
                    <DxSeries
                        v-for="tag in allTags"
                        :key="tag.key"
                        :value-field="tag.key"
                        :name="tag.tag"
                        :axis="tag.key"
                        :color="tagColor(tag)"
                    />

                    <!-- Value axis por tag (escalas independientes) -->
                    <DxValueAxis
                        v-for="tag in allTags"
                        :key="`ax-${tag.key}`"
                        :name="tag.key"
                        :position="axisPos(tag)"
                        :color="tagColor(tag)"
                        :tick="{ color: tagColor(tag) }"
                        :label="{ font: { size: 10, color: tagColor(tag) } }"
                        :show-zero="false"
                    />

                    <!-- Eje X -->
                    <DxArgumentAxis
                        :tick-interval="{ minutes: 10 }"
                        argument-type="string"
                        :label="{ font: { size: 10 } }"
                    />

                    <!-- Crosshair tipo IP21 (solo vertical) -->
                    <DxCrosshair :enabled="true" color="#888" :width="1" dash-style="dash">
                        <DxHorizontalLine :visible="false" />
                    </DxCrosshair>

                    <!-- Tooltip compartido -->
                    <DxTooltip
                        :enabled="true"
                        :shared="true"
                        location="edge"
                        :customize-tooltip="customizeTooltip"
                        z-index="9999"
                    />

                    <!-- Zoom & Pan -->
                    <DxZoomAndPan argument-axis="both" value-axis="none" :allow-mouse-wheel="true" />
                    <DxScrollBar :visible="true" />

                    <!-- Leyenda -->
                    <DxLegend
                        vertical-alignment="top"
                        horizontal-alignment="right"
                        :column-count="4"
                        :item-text-format="t => t"
                        :font="{ size: 11 }"
                    />

                    <!-- Exportar -->
                    <DxExport :enabled="true" />
                </DxChart>
            </div>

            <!-- ── RANGE SELECTOR (navegador inferior) ──────────────────── -->
            <div class="ta-range">
                <DxRangeSelector
                    :data-source="chartData"
                    v-model:value="rsValue"
                    @value-changed="onRangeChanged"
                    style="width:100%"
                >
                    <DxRsSize :height="70" />
                    <DxScale minor-tick-interval="" tick-interval="" />
                    <DxBehavior :snap-to-ticks="false" :animation-enabled="false" />
                    <DxRsChart>
                        <DxRsSeries
                            v-for="tag in allTags"
                            :key="`rs-${tag.key}`"
                            :value-field="tag.key"
                            :color="tagColor(tag)"
                            type="line"
                            :width="1"
                        />
                    </DxRsChart>
                </DxRangeSelector>
            </div>

            <!-- ── TABLA DE VARIABLES (DxDataGrid) ──────────────────────── -->
            <div class="ta-grid">
                <DxDataGrid
                    :data-source="gridData"
                    :show-borders="false"
                    :row-alternation-enabled="true"
                    :column-auto-width="false"
                    :allow-column-resizing="true"
                    style="height:100%"
                >
                    <DxScrolling mode="standard" />

                    <DxColumn data-field="colorDot"  caption="" :width="28" cell-template="dotTpl" :allow-sorting="false" />
                    <DxColumn data-field="tag"       caption="Tag"          :width="90"  css-class="ta-mono" />
                    <DxColumn data-field="desc"      caption="Descripción"  :min-width="140" />
                    <DxColumn data-field="unidad"    caption="Unidad"       :width="70" />
                    <DxColumn data-field="last"      caption="Valor actual" :width="90" css-class="ta-val" />
                    <DxColumn data-field="min"       caption="Mín"          :width="70" />
                    <DxColumn data-field="max"       caption="Máx"          :width="70" />
                    <DxColumn data-field="avg"       caption="Prom"         :width="70" />
                    <DxColumn data-field="tipo"      caption="Tipo"         :width="60" />
                    <DxColumn data-field="alarmaHi"  caption="Alarma Hi"   :width="80" />
                    <DxColumn data-field="alarmaLo"  caption="Alarma Lo"   :width="80" />
                    <DxColumn data-field="calidad"   caption="Calidad"      :width="80" cell-template="qualTpl" />

                    <template #dotTpl="{ data }">
                        <span class="ta-dot" :style="`background:${data.data.colorDot}`" />
                    </template>

                    <template #qualTpl="{ data }">
                        <span :class="`ta-qual ta-qual-${data.data.calidad === 'Alarma' ? 'alarm' : 'ok'}`">
                            {{ data.data.calidad }}
                        </span>
                    </template>
                </DxDataGrid>
            </div>
        </template>

        <!-- ══════════════════════════════════════════════════════════════
             PANEL DE MÉTRICAS OPERATIVAS (Producción / Compras / Ventas)
        ══════════════════════════════════════════════════════════════ -->
        <template v-if="props.operMetrics.length">

            <!-- Cabecera del panel ─────────────────────────────────────── -->
            <div class="ta-oper-header">
                <i class="pi pi-chart-bar" />
                <span>Métricas Operativas</span>
                <span class="ta-oper-count">{{ props.operMetrics.length }}</span>
                <!-- Chips de métricas activas -->
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

            <!-- Chart de operaciones ─────────────────────────────────── -->
            <div class="ta-oper-chart">
                <DxChart
                    :data-source="operChartData"
                    argument-field="time"
                    style="height:100%;width:100%"
                >
                    <DxCommonSeriesSettings type="spline" :width="2" />

                    <DxSeries
                        v-for="m in props.operMetrics"
                        :key="m.key"
                        :value-field="m.key"
                        :name="m.label"
                        :axis="m.key"
                        :color="operColor(m)"
                    />

                    <DxValueAxis
                        v-for="m in props.operMetrics"
                        :key="`oax-${m.key}`"
                        :name="m.key"
                        :position="props.operMetrics.indexOf(m) % 2 === 0 ? 'left' : 'right'"
                        :color="operColor(m)"
                        :tick="{ color: operColor(m) }"
                        :label="{ font: { size: 10, color: operColor(m) } }"
                        :title="{ text: m.unidad, font: { size: 9 } }"
                        :show-zero="false"
                    />

                    <DxArgumentAxis
                        argument-type="string"
                        :label="{ font: { size: 10 } }"
                    />

                    <DxCrosshair :enabled="true" color="#888" :width="1" dash-style="dash">
                        <DxHorizontalLine :visible="false" />
                    </DxCrosshair>

                    <DxTooltip :enabled="true" :shared="true" location="edge" z-index="9999" />
                    <DxLegend vertical-alignment="top" horizontal-alignment="right" :font="{ size: 11 }" />
                    <DxExport :enabled="true" />
                </DxChart>
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

/* ── Secciones ─────────────────────────────────────────────────────────────── */
.ta-chart-area { flex: 1; min-height: 0; overflow: hidden; }
.ta-range      { height: 74px; border-top: 1px solid var(--p-surface-200); }
.ta-grid       { height: 130px; border-top: 1px solid var(--p-surface-200); overflow: hidden; }

/* ── Celdas de la tabla ────────────────────────────────────────────────────── */
.ta-dot {
    display: inline-block; width: 10px; height: 10px;
    border-radius: 50%; margin: 0 auto; display: block;
}
:deep(.ta-mono) { font-family: monospace; font-weight: 600; font-size: 0.8rem; }
:deep(.ta-val)  { font-weight: 700; }

.ta-qual {
    display: inline-block; padding: 1px 6px; border-radius: 3px;
    font-size: 0.68rem; font-weight: 600;
}
.ta-qual-ok    { background: #dcfce7; color: #15803d; }
.ta-qual-alarm { background: #fee2e2; color: #b91c1c; }

/* ══════════════════════════════════════════════════════════════════════════════
   PANEL DE MÉTRICAS OPERATIVAS
   ══════════════════════════════════════════════════════════════════════════════ */
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

.ta-oper-chart { height: 220px; border-top: 1px solid var(--p-surface-200); }
</style>
