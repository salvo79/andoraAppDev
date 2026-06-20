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
import { DxSplitter, DxItem } from 'devextreme-vue/splitter';
import { computed, ref, watch } from 'vue';

// ── Props ─────────────────────────────────────────────────────────────────────
const props = defineProps({
    tags:           { type: Array,  default: () => [] },
    range:          { type: String, default: '8h' },
    calcVars:       { type: Array,  default: () => [] },
    operMetrics:    { type: Array,  default: () => [] },
    pendingDragTags: { type: Array, default: () => [] },
});
const emit = defineEmits(['remove-tag', 'remove-metric', 'drop-tags']);

function onRootDrop(e) {
    e.preventDefault();
    // Canal 1: dataTransfer (payload = { nodeType:'tags', items:[...] })
    const raw = e.dataTransfer.getData('application/andora-node')
             || e.dataTransfer.getData('text/plain');
    if (raw) {
        try {
            const payload = JSON.parse(raw);
            if (payload.nodeType === 'tags' && payload.items?.length) {
                emit('drop-tags', payload.items);
                return;
            }
        } catch { /* ignore */ }
    }
    // Canal 2: prop pendingDragTags (cuando DevExtreme vacía dataTransfer)
    if (props.pendingDragTags.length) {
        emit('drop-tags', props.pendingDragTags);
    }
}

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
    <div class="ta-root"
         @dragover.prevent
         @dragenter.prevent
         @drop="onRootDrop">

        <!-- ── Sin variables del árbol ───────────────────────────────────── -->
        <div v-if="!allTags.length" class="ta-empty">
            <i class="pi pi-wave-pulse ta-empty-icon" />
            <p class="ta-empty-title"> seleccionadas</p>
            <p class="ta-empty-sub">
                Arrastra un tag desde el árbol de proceso, o doble clic sobre él
            </p>
        </div>

        <!-- ── Contenido principal (tags) ────────────────────────────────── -->
        <template v-if="allTags.length">

            <!-- DxSplitter vertical: gráfico arriba, grid abajo ─────────── -->
            <DxSplitter orientation="vertical"
                        class="ta-splitter-root">

                <!-- ── PANEL SUPERIOR: Chart + RangeSelector ────────────── -->
                <DxItem :resizable="true">
                    <div class="ta-top-pane">

                        <!-- Chips de variables activas -->
                        <div class="ta-chips-bar">
                            <span v-for="tag in allTags" :key="tag.key"
                                  class="ta-chip"
                                  :style="`border-color:${tagColor(tag)};color:${tagColor(tag)}`">
                                <span class="ta-chip-dot" :style="`background:${tagColor(tag)}`" />
                                {{ tag.tag || tag.key }}
                                <span v-if="tag.unidad" class="ta-chip-unit">{{ tag.unidad }}</span>
                                <button class="ta-chip-del" @click="emit('remove-tag', tag.key)">×</button>
                            </span>
                        </div>

                        <!-- Chart principal -->
                        <div class="ta-chart-area">
                            <DxChart
                                ref="chartRef"
                                :data-source="chartData"
                                argument-field="time"
                                :palette="TAG_COLORS.map(c => c.border)"
                                style="height:100%;width:100%"
                                @initialized="e => chartRef = e.component"
                            >
                                <DxCommonSeriesSettings type="spline" :width="2" />
                                <DxSeries
                                    v-for="tag in allTags" :key="tag.key"
                                    :value-field="tag.key" :name="tag.tag"
                                    :axis="tag.key" :color="tagColor(tag)"
                                />
                                <DxValueAxis
                                    v-for="tag in allTags" :key="`ax-${tag.key}`"
                                    :name="tag.key" :position="axisPos(tag)"
                                    :color="tagColor(tag)"
                                    :tick="{ color: tagColor(tag) }"
                                    :label="{ font: { size: 10, color: tagColor(tag) } }"
                                    :show-zero="false"
                                />
                                <DxArgumentAxis
                                    :tick-interval="{ minutes: 10 }"
                                    argument-type="string"
                                    :label="{ font: { size: 10 } }"
                                />
                                <DxCrosshair :enabled="true" color="#888" :width="1" dash-style="dash">
                                    <DxHorizontalLine :visible="false" />
                                </DxCrosshair>
                                <DxTooltip
                                    :enabled="true" :shared="true" location="edge"
                                    :customize-tooltip="customizeTooltip" z-index="9999"
                                />
                                <DxZoomAndPan argument-axis="both" value-axis="none" :allow-mouse-wheel="true" />
                                <DxScrollBar :visible="true" />
                                <DxLegend
                                    vertical-alignment="top" horizontal-alignment="right"
                                    :column-count="4" :item-text-format="t => t"
                                    :font="{ size: 11 }"
                                />
                                <DxExport :enabled="true" />
                            </DxChart>
                        </div>

                        <!-- RangeSelector -->
                        <div class="ta-range">
                            <DxRangeSelector
                                :data-source="chartData"
                                v-model:value="rsValue"
                                @value-changed="onRangeChanged"
                                style="width:100%"
                            >
                                <DxRsSize :height="68" />
                                <DxScale minor-tick-interval="" tick-interval="" />
                                <DxBehavior :snap-to-ticks="false" :animation-enabled="false" />
                                <DxRsChart>
                                    <DxRsSeries
                                        v-for="tag in allTags" :key="`rs-${tag.key}`"
                                        :value-field="tag.key" :color="tagColor(tag)"
                                        type="line" :width="1"
                                    />
                                </DxRsChart>
                            </DxRangeSelector>
                        </div>

                    </div>
                </DxItem>

                <!-- ── PANEL INFERIOR: Grid de variables ─────────────────── -->
                <DxItem size="175px" :collapsible="true" collapsed-size="28px" min-size="28px">
                    <div class="ta-bottom-pane">

                        <div class="ta-grid-header">
                            <i class="pi pi-table" />
                            <span>Variables del análisis</span>
                            <span class="ta-grid-count">{{ allTags.length }}</span>
                        </div>

                        <DxDataGrid
                            :data-source="gridData"
                            :show-borders="false"
                            :row-alternation-enabled="true"
                            :column-auto-width="false"
                            :allow-column-resizing="true"
                            style="height:calc(100% - 26px)"
                        >
                            <DxScrolling mode="standard" />
                            <DxColumn data-field="colorDot" caption=""           :width="26"  cell-template="dotTpl"  :allow-sorting="false" />
                            <DxColumn data-field="tag"      caption="Tag"         :width="90"  css-class="ta-mono" />
                            <DxColumn data-field="desc"     caption="Descripción" :min-width="130" />
                            <DxColumn data-field="unidad"   caption="Unidad"      :width="65" />
                            <DxColumn data-field="last"     caption="Actual"      :width="80"  css-class="ta-val" />
                            <DxColumn data-field="min"      caption="Mín"         :width="65" />
                            <DxColumn data-field="max"      caption="Máx"         :width="65" />
                            <DxColumn data-field="avg"      caption="Prom"        :width="65" />
                            <DxColumn data-field="tipo"     caption="Tipo"        :width="55" />
                            <DxColumn data-field="alarmaHi" caption="Hi"          :width="70" />
                            <DxColumn data-field="alarmaLo" caption="Lo"          :width="70" />
                            <DxColumn data-field="calidad"  caption="Calidad"     :width="75"  cell-template="qualTpl" />

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
                </DxItem>

            </DxSplitter>

        </template>

        <!-- ── Métricas operativas (Producción / Compras / Ventas) ───── -->
        <template v-if="props.operMetrics.length">
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
                <div class="ta-oper-chart">
                    <DxChart :data-source="operChartData" argument-field="time" style="height:100%;width:100%">
                        <DxCommonSeriesSettings type="spline" :width="2" />
                        <DxSeries v-for="m in props.operMetrics" :key="m.key"
                            :value-field="m.key" :name="m.label"
                            :axis="m.key" :color="operColor(m)" />
                        <DxValueAxis v-for="m in props.operMetrics" :key="`oax-${m.key}`"
                            :name="m.key"
                            :position="props.operMetrics.indexOf(m) % 2 === 0 ? 'left' : 'right'"
                            :color="operColor(m)"
                            :tick="{ color: operColor(m) }"
                            :label="{ font: { size: 10, color: operColor(m) } }"
                            :title="{ text: m.unidad, font: { size: 9 } }"
                            :show-zero="false" />
                        <DxArgumentAxis argument-type="string" :label="{ font: { size: 10 } }" />
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
/* ── Root ──────────────────────────────────────────────────────────────────── */
.ta-root {
    display: flex; flex-direction: column;
    height: 100%; width: 100%;
    overflow: hidden;
    background: var(--p-surface-0);
}

/* ── Vacío ─────────────────────────────────────────────────────────────────── */
.ta-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; gap: 10px; color: var(--p-text-muted-color); padding: 2rem;
}
.ta-empty-icon  { font-size: 4rem; opacity: 0.12; }
.ta-empty-title { font-size: 1rem; font-weight: 600; margin: 0; }
.ta-empty-sub   { font-size: 0.8rem; margin: 0; text-align: center; }

/* ── DxSplitter principal ──────────────────────────────────────────────────── */
.ta-splitter-root { flex: 1; min-height: 0; width: 100%; }

/* ── Panel superior ────────────────────────────────────────────────────────── */
.ta-top-pane {
    display: flex; flex-direction: column;
    height: 100%; overflow: hidden;
}

/* Chips de variables activas */
.ta-chips-bar {
    display: flex; flex-wrap: wrap; gap: 4px;
    padding: 4px 8px; flex-shrink: 0;
    border-bottom: 1px solid var(--p-surface-200);
    background: var(--p-surface-50);
    min-height: 28px;
}
.ta-chip {
    display: inline-flex; align-items: center; gap: 4px;
    border: 1px solid; border-radius: 12px;
    padding: 1px 7px 1px 5px; font-size: 0.67rem; font-weight: 600;
    background: var(--p-surface-0);
}
.ta-chip-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.ta-chip-unit {
    background: var(--p-surface-200); border-radius: 3px;
    padding: 0 4px; font-size: 0.58rem; color: var(--p-text-muted-color);
}
.ta-chip-del {
    background: none; border: none; cursor: pointer;
    font-size: 0.85rem; line-height: 1; color: inherit;
    opacity: 0.5; padding: 0; margin-left: 1px;
}
.ta-chip-del:hover { opacity: 1; }

.ta-chart-area { flex: 1; min-height: 0; overflow: hidden; }
.ta-range      { height: 72px; flex-shrink: 0; border-top: 1px solid var(--p-surface-200); }

/* ── Panel inferior ────────────────────────────────────────────────────────── */
.ta-bottom-pane { height: 100%; display: flex; flex-direction: column; overflow: hidden; }

.ta-grid-header {
    display: flex; align-items: center; gap: 6px;
    padding: 3px 10px; flex-shrink: 0;
    background: var(--p-surface-100);
    border-bottom: 1px solid var(--p-surface-200);
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.03em;
    text-transform: uppercase; color: var(--p-text-muted-color);
}
.ta-grid-count {
    background: var(--p-primary-color); color: #fff;
    border-radius: 8px; font-size: 0.58rem; padding: 0 5px;
}

/* ── Celdas grid ───────────────────────────────────────────────────────────── */
.ta-dot {
    display: block; width: 10px; height: 10px;
    border-radius: 50%; margin: 0 auto;
}
:deep(.ta-mono) { font-family: monospace; font-weight: 600; font-size: 0.8rem; }
:deep(.ta-val)  { font-weight: 700; }

.ta-qual {
    display: inline-block; padding: 1px 6px; border-radius: 3px;
    font-size: 0.67rem; font-weight: 600;
}
.ta-qual-ok    { background: #dcfce7; color: #15803d; }
.ta-qual-alarm { background: #fee2e2; color: #b91c1c; }

/* ══════════════════════════════════════════════════════════════════════════════
   MÉTRICAS OPERATIVAS
   ══════════════════════════════════════════════════════════════════════════════ */
.ta-oper-header {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex-shrink: 0;
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
    display: flex; align-items: center; gap: 4px; border: 1px solid; border-radius: 12px;
    padding: 1px 8px; font-size: 0.67rem; font-weight: 600; background: var(--p-surface-0);
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
.ta-oper-chart { height: 220px; flex-shrink: 0; border-top: 1px solid var(--p-surface-200); }
</style>
