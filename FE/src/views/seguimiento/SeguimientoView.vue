<script setup>
import ProcessTree from '@/components/seguimiento/ProcessTree.vue';
import TrendChart  from '@/components/seguimiento/TrendChart.vue';
import { ref, computed, onUnmounted } from 'vue';

// ── Estado ────────────────────────────────────────────────────────────────────
const activeTags  = ref([]);
const range       = ref('8h');
const autoRefresh = ref(false);
const refreshKey  = ref(0);
const columns     = ref(1);
let   refreshTimer = null;

const ranges = [
    { label: '1 h',  value: '1h'  },
    { label: '4 h',  value: '4h'  },
    { label: '8 h',  value: '8h'  },
    { label: '24 h', value: '24h' },
    { label: '3 d',  value: '3d'  },
    { label: '7 d',  value: '7d'  },
];

// ── CRUD de tags ──────────────────────────────────────────────────────────────
function addTag(tagData) {
    if (activeTags.value.find(t => t.key === tagData.key)) return;
    if (activeTags.value.length >= 8) return;
    activeTags.value.push(tagData);
}
function removeTag(key) {
    activeTags.value = activeTags.value.filter(t => t.key !== key);
}
function clearAll() { activeTags.value = []; }

// ── Refresco ──────────────────────────────────────────────────────────────────
function toggleAutoRefresh() {
    autoRefresh.value = !autoRefresh.value;
    if (autoRefresh.value) {
        refreshTimer = setInterval(() => refreshKey.value++, 10_000);
    } else {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}
function manualRefresh() { refreshKey.value++; }
onUnmounted(() => clearInterval(refreshTimer));

// ── Reloj ─────────────────────────────────────────────────────────────────────
function fmtNow() {
    return new Date().toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}
const now = ref(fmtNow());
const clockTimer = setInterval(() => (now.value = fmtNow()), 1000);
onUnmounted(() => clearInterval(clockTimer));

const colClass = computed(() => columns.value === 2 ? 'grid grid-cols-2 gap-2' : '');
</script>

<template>
    <!-- Contenedor principal tipo VB ─────────────────────────────────────── -->
    <div class="hist-root flex flex-column">

        <!-- ══ TOOLBAR ══════════════════════════════════════════════════════ -->
        <div class="hist-toolbar flex align-items-center gap-1 flex-wrap">

            <!-- Icono + título -->
            <span class="hist-title">
                <i class="pi pi-wave-pulse" />
                Seguimiento Operativo — Historiador de Proceso
            </span>

            <div class="hist-sep" />

            <!-- Rango temporal -->
            <span class="hist-label">Rango:</span>
            <SelectButton
                v-model="range"
                :options="ranges"
                optionLabel="label"
                optionValue="value"
                class="hist-range-btn"
                size="small"
            />

            <div class="hist-sep" />

            <!-- Layout gráficas -->
            <span class="hist-label">Vista:</span>
            <Button icon="pi pi-list"  text rounded size="small"
                    :class="columns===1 ? 'hist-btn-active' : 'hist-btn'"
                    v-tooltip.bottom="'Una columna'" @click="columns=1" />
            <Button icon="pi pi-table" text rounded size="small"
                    :class="columns===2 ? 'hist-btn-active' : 'hist-btn'"
                    v-tooltip.bottom="'Dos columnas'" @click="columns=2" />

            <div class="hist-sep" />

            <!-- Acciones -->
            <Button icon="pi pi-refresh" text rounded size="small" class="hist-btn"
                    v-tooltip.bottom="'Refrescar'" @click="manualRefresh" />

            <Button :icon="autoRefresh ? 'pi pi-pause' : 'pi pi-play'"
                    text rounded size="small"
                    :class="autoRefresh ? 'hist-btn-live' : 'hist-btn'"
                    v-tooltip.bottom="autoRefresh ? 'Pausar' : 'Auto-refresco 10 s'"
                    @click="toggleAutoRefresh" />

            <Button v-if="activeTags.length" icon="pi pi-trash"
                    text rounded size="small" class="hist-btn-danger"
                    v-tooltip.bottom="'Limpiar tendencias'" @click="clearAll" />

            <!-- Reloj -->
            <span class="hist-clock ml-auto">
                <i class="pi pi-clock" /> {{ now }}
                <span v-if="autoRefresh" class="hist-live-dot" />
            </span>
        </div>

        <!-- ══ CUERPO: árbol izquierda | gráficas derecha ═══════════════════ -->
        <Splitter class="hist-body flex-1">

            <!-- ── Panel IZQUIERDO: Árbol de proceso ───────────────────────── -->
            <SplitterPanel :size="22" :minSize="14" class="hist-tree-panel flex flex-column">

                <!-- Cabecera del árbol -->
                <div class="hist-panel-header">
                    <i class="pi pi-sitemap" />
                    <span>Árbol de Proceso</span>
                    <Badge v-if="activeTags.length"
                           :value="activeTags.length"
                           severity="info"
                           class="ml-auto hist-badge" />
                </div>

                <!-- Árbol -->
                <div class="hist-tree-body flex-1 overflow-auto">
                    <ProcessTree @add-tag="addTag" />
                </div>

                <!-- Tags activos (lista compacta) -->
                <div v-if="activeTags.length" class="hist-active-list">
                    <div class="hist-panel-header" style="border-top:1px solid var(--hist-border)">
                        <i class="pi pi-chart-line" />
                        <span>Tendencias activas</span>
                    </div>
                    <div
                        v-for="(tag, i) in activeTags"
                        :key="tag.key"
                        class="hist-tag-row"
                    >
                        <span class="hist-tag-dot"
                              :style="`background:var(--hist-color-${i % 8})`" />
                        <span class="hist-tag-name">{{ tag.tag }}</span>
                        <span class="hist-tag-unit">{{ tag.unidad }}</span>
                        <Button icon="pi pi-times" text rounded
                                style="width:1.2rem;height:1.2rem;padding:0;font-size:0.6rem"
                                severity="secondary" @click="removeTag(tag.key)" />
                    </div>
                </div>
            </SplitterPanel>

            <!-- ── Panel DERECHO: Gráficas historian ───────────────────────── -->
            <SplitterPanel :size="78" :minSize="50" class="hist-charts-panel overflow-y-auto">

                <!-- Estado vacío -->
                <div v-if="activeTags.length === 0"
                     class="hist-empty">
                    <i class="pi pi-wave-pulse hist-empty-icon" />
                    <p class="hist-empty-title">Sin tendencias seleccionadas</p>
                    <p class="hist-empty-sub">Haga doble clic en un tag del árbol para agregarlo al historiador</p>
                </div>

                <!-- Tendencias -->
                <div v-else :class="['hist-trends-wrap', colClass]">
                    <TrendChart
                        v-for="(tag, idx) in activeTags"
                        :key="`${tag.key}-${refreshKey}`"
                        :tagData="tag"
                        :range="range"
                        :colorIndex="idx"
                        @remove="removeTag"
                    />
                </div>
            </SplitterPanel>

        </Splitter>

        <!-- ══ STATUS BAR ════════════════════════════════════════════════════ -->
        <div class="hist-statusbar">
            <span><i class="pi pi-database" /> andoraDB · andoraDB</span>
            <span class="hist-sep-v" />
            <span>
                <i class="pi pi-tag" />
                Tags activos: <strong>{{ activeTags.length }}</strong> / 8
            </span>
            <span class="hist-sep-v" />
            <span>
                <i class="pi pi-clock" /> Rango: {{ range }}
            </span>
            <span class="hist-sep-v" />
            <span :class="autoRefresh ? 'hist-status-live' : ''">
                <i :class="autoRefresh ? 'pi pi-circle-fill' : 'pi pi-circle'" />
                {{ autoRefresh ? 'En línea — refresco 10 s' : 'Manual' }}
            </span>
            <span class="ml-auto">
                anDora Process Historian v1.0
            </span>
        </div>
    </div>
</template>

<style scoped>
/* ── Paleta de colores por índice ── */
:root {
    --hist-color-0: #3B82F6;
    --hist-color-1: #10B981;
    --hist-color-2: #F59E0B;
    --hist-color-3: #EF4444;
    --hist-color-4: #8B5CF6;
    --hist-color-5: #06B6D4;
    --hist-color-6: #F97316;
    --hist-color-7: #84CC16;
    --hist-border:  var(--p-surface-200, #e2e8f0);
    --hist-bg:      var(--p-surface-50,  #f8fafc);
    --hist-header:  var(--p-surface-100, #f1f5f9);
}

/* ── Raíz ──────────────────────────────────────────────────────────────────── */
.hist-root {
    height: calc(100vh - 120px);
    border: 1px solid var(--hist-border);
    border-radius: 4px;
    overflow: hidden;
    background: var(--hist-bg);
    font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Toolbar ───────────────────────────────────────────────────────────────── */
.hist-toolbar {
    background: var(--hist-header);
    border-bottom: 1px solid var(--hist-border);
    padding: 4px 8px;
    min-height: 38px;
    gap: 4px;
}

.hist-title {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
}

.hist-label {
    font-size: 0.72rem;
    color: var(--p-text-muted-color, #94a3b8);
    white-space: nowrap;
}

.hist-sep {
    width: 1px;
    height: 20px;
    background: var(--hist-border);
    margin: 0 4px;
}

.hist-btn       { opacity: 0.6; }
.hist-btn-active { opacity: 1; color: var(--p-primary-color) !important; }
.hist-btn-live   { color: #10B981 !important; }
.hist-btn-danger { opacity: 0.7; color: #EF4444 !important; }

/* Rango: botones más pequeños */
.hist-range-btn :deep(.p-selectbutton .p-button) {
    padding: 2px 8px;
    font-size: 0.72rem;
}

.hist-clock {
    font-size: 0.72rem;
    font-family: 'Courier New', monospace;
    color: var(--p-text-muted-color, #64748b);
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
}

.hist-live-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: #10B981;
    border-radius: 50%;
    animation: blink 1.2s infinite;
}

/* ── Cuerpo ─────────────────────────────────────────────────────────────────── */
.hist-body {
    min-height: 0;
    border: none !important;
    border-radius: 0 !important;
}

/* ── Panel árbol ────────────────────────────────────────────────────────────── */
.hist-tree-panel {
    border-right: 1px solid var(--hist-border);
    background: var(--hist-bg);
    min-height: 0;
}

.hist-panel-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    font-size: 0.72rem;
    font-weight: 600;
    background: var(--hist-header);
    border-bottom: 1px solid var(--hist-border);
    color: var(--p-text-muted-color, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.hist-badge { font-size: 0.6rem !important; }

.hist-tree-body {
    padding: 4px 0;
}

/* Árbol interno: texto compacto */
.hist-tree-body :deep(.p-tree-node-label) { font-size: 0.78rem; }
.hist-tree-body :deep(.p-tree-node-content) { padding: 2px 4px; }

/* ── Lista de tags activos ───────────────────────────────────────────────────── */
.hist-active-list {
    border-top: 1px solid var(--hist-border);
    max-height: 180px;
    overflow-y: auto;
}

.hist-tag-row {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    font-size: 0.72rem;
    border-bottom: 1px solid var(--hist-border);
}
.hist-tag-row:hover { background: var(--hist-header); }

.hist-tag-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
.hist-tag-name { flex: 1; font-weight: 600; font-family: monospace; font-size: 0.75rem; }
.hist-tag-unit { color: var(--p-text-muted-color, #94a3b8); font-size: 0.68rem; }

/* Colores para los puntos de la lista activa */
.hist-tag-row:nth-child(1) .hist-tag-dot { background: var(--hist-color-0); }
.hist-tag-row:nth-child(2) .hist-tag-dot { background: var(--hist-color-1); }
.hist-tag-row:nth-child(3) .hist-tag-dot { background: var(--hist-color-2); }
.hist-tag-row:nth-child(4) .hist-tag-dot { background: var(--hist-color-3); }
.hist-tag-row:nth-child(5) .hist-tag-dot { background: var(--hist-color-4); }
.hist-tag-row:nth-child(6) .hist-tag-dot { background: var(--hist-color-5); }
.hist-tag-row:nth-child(7) .hist-tag-dot { background: var(--hist-color-6); }
.hist-tag-row:nth-child(8) .hist-tag-dot { background: var(--hist-color-7); }

/* ── Panel gráficas ─────────────────────────────────────────────────────────── */
.hist-charts-panel {
    background: var(--p-surface-ground, #ffffff);
}

.hist-trends-wrap { padding: 8px; }

/* Estado vacío */
.hist-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 10px;
    color: var(--p-text-muted-color, #94a3b8);
    padding: 2rem;
}
.hist-empty-icon  { font-size: 4rem; opacity: 0.15; }
.hist-empty-title { font-size: 1rem; font-weight: 600; margin: 0; }
.hist-empty-sub   { font-size: 0.8rem; margin: 0; text-align: center; }

/* ── Status bar ─────────────────────────────────────────────────────────────── */
.hist-statusbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 10px;
    font-size: 0.68rem;
    background: var(--hist-header);
    border-top: 1px solid var(--hist-border);
    color: var(--p-text-muted-color, #64748b);
    min-height: 22px;
    white-space: nowrap;
    overflow: hidden;
}
.hist-sep-v {
    width: 1px;
    height: 12px;
    background: var(--hist-border);
}
.hist-status-live { color: #10B981; font-weight: 600; }

/* ── Animaciones ─────────────────────────────────────────────────────────────── */
@keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
}
</style>
