<script setup>
import ProcessTreeDock from '@/components/historiador/ProcessTreeDock.vue';
import TrendAnalysis   from '@/components/historiador/TrendAnalysis.vue';
import VarBuilderDock  from '@/components/historiador/VarBuilderDock.vue';
import { computed, ref } from 'vue';

// ══════════════════════════════════════════════════════════════════════════════
// ESTADO GLOBAL DEL HISTORIADOR
// ══════════════════════════════════════════════════════════════════════════════

// ── Docks ─────────────────────────────────────────────────────────────────────
const leftOpen  = ref(true);
const rightOpen = ref(true);
const LEFT_W    = 240;  // px cuando abierto
const RIGHT_W   = 270;  // px cuando abierto

// ── Tabs de análisis ──────────────────────────────────────────────────────────
let   tabCounter = 1;
const tabs = ref([
    { id: 1, title: 'Análisis 1', tags: [], calcVars: [], range: '8h' },
]);
const activeId  = ref(1);
const activeTab = computed(() => tabs.value.find(t => t.id === activeId.value));

function newTab() {
    tabCounter++;
    const tab = { id: tabCounter, title: `Análisis ${tabCounter}`, tags: [], calcVars: [], range: '8h' };
    tabs.value.push(tab);
    activeId.value = tab.id;
}

function closeTab(id) {
    const idx = tabs.value.findIndex(t => t.id === id);
    tabs.value = tabs.value.filter(t => t.id !== id);
    if (!tabs.value.length) { tabCounter++; tabs.value = [{ id: tabCounter, title: 'Análisis 1', tags: [], calcVars: [], range: '8h' }]; }
    activeId.value = tabs.value[Math.min(idx, tabs.value.length - 1)].id;
}

function activateTab(id) { activeId.value = id; }

// ── Agregar tag (desde árbol) ─────────────────────────────────────────────────
function addTag(tagData) {
    const tab = activeTab.value;
    if (!tab) return;
    if (tab.tags.find(t => t.key === tagData.key)) return;
    if (tab.tags.length >= 8) return;
    tab.tags = [...tab.tags, tagData];
}

function removeTag(key) {
    const tab = activeTab.value;
    if (!tab) return;
    tab.tags = tab.tags.filter(t => t.key !== key);
}

// ── Variables calculadas ──────────────────────────────────────────────────────
function addCalcVar(cv) {
    const tab = activeTab.value;
    if (!tab) return;
    tab.calcVars = [...(tab.calcVars || []), cv];
}

function removeCalcVar(key) {
    const tab = activeTab.value;
    if (!tab) return;
    tab.calcVars = (tab.calcVars || []).filter(c => c.key !== key);
}

// ── Rango temporal ────────────────────────────────────────────────────────────
const RANGES = [
    { label: '30m', value: '1h'  },
    { label: '1h',  value: '1h'  },
    { label: '4h',  value: '4h'  },
    { label: '8h',  value: '8h'  },
    { label: '24h', value: '24h' },
    { label: '3d',  value: '3d'  },
    { label: '7d',  value: '7d'  },
];

function setRange(r) {
    if (activeTab.value) activeTab.value.range = r;
}

// ── Reloj ─────────────────────────────────────────────────────────────────────
function fmtNow() {
    return new Date().toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}
const now = ref(fmtNow());
setInterval(() => (now.value = fmtNow()), 1000);

// ── Limpiar análisis actual ───────────────────────────────────────────────────
function clearAnalysis() {
    if (!activeTab.value) return;
    activeTab.value.tags     = [];
    activeTab.value.calcVars = [];
}

// ── Total de tags en pestaña activa ──────────────────────────────────────────
const activeTagCount = computed(() =>
    (activeTab.value?.tags?.length ?? 0) + (activeTab.value?.calcVars?.length ?? 0)
);
</script>

<template>
    <div class="vs-root">

        <!-- ════════════════════════════════════════════════════════════════
             TITLE BAR  (Visual Studio style)
        ════════════════════════════════════════════════════════════════ -->
        <div class="vs-titlebar">
            <div class="vs-titlebar-left">
                <i class="pi pi-wave-pulse vs-logo" />
                <span class="vs-app-name">anDora Process Explorer</span>
                <span class="vs-sep">|</span>
                <span class="vs-subtitle">Historiador Multivariable</span>
            </div>
            <div class="vs-titlebar-right">
                <i class="pi pi-clock" />
                <span class="vs-clock">{{ now }}</span>
            </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             MAIN TOOLBAR  (comandos globales)
        ════════════════════════════════════════════════════════════════ -->
        <div class="vs-toolbar">

            <!-- Toggle docks -->
            <button class="vs-tbtn" :class="leftOpen  ? 'vs-tbtn-active' : ''"
                    title="Árbol de Proceso" @click="leftOpen = !leftOpen">
                <i class="pi pi-list" />
            </button>
            <button class="vs-tbtn" :class="rightOpen ? 'vs-tbtn-active' : ''"
                    title="Constructor de Variables" @click="rightOpen = !rightOpen">
                <i class="pi pi-calculator" />
            </button>

            <div class="vs-tbsep" />

            <!-- Rango temporal -->
            <span class="vs-tblabel">Rango:</span>
            <button
                v-for="r in RANGES"
                :key="r.label"
                class="vs-tbtn vs-range-btn"
                :class="activeTab?.range === r.value && r.label !== '30m' ? 'vs-tbtn-active' : ''"
                @click="setRange(r.value)"
            >{{ r.label }}</button>

            <div class="vs-tbsep" />

            <!-- Nueva pestaña / limpiar -->
            <button class="vs-tbtn" title="Nuevo análisis" @click="newTab">
                <i class="pi pi-plus" />
            </button>
            <button class="vs-tbtn" title="Limpiar análisis" @click="clearAnalysis">
                <i class="pi pi-trash" />
            </button>

            <!-- Spacer -->
            <div style="flex:1" />

            <!-- Indicador tags activos -->
            <div class="vs-tag-counter">
                <i class="pi pi-chart-line" />
                {{ activeTagCount }} / 8 variables
            </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             TABS BAR
        ════════════════════════════════════════════════════════════════ -->
        <div class="vs-tabbar">
            <div
                v-for="tab in tabs"
                :key="tab.id"
                class="vs-tab"
                :class="{ 'vs-tab-active': tab.id === activeId }"
                @click="activateTab(tab.id)"
            >
                <i class="pi pi-chart-line vs-tab-icon" />
                <span class="vs-tab-title">{{ tab.title }}</span>
                <span v-if="(tab.tags?.length || 0) + (tab.calcVars?.length || 0)"
                      class="vs-tab-badge">
                    {{ (tab.tags?.length || 0) + (tab.calcVars?.length || 0) }}
                </span>
                <button class="vs-tab-close" @click.stop="closeTab(tab.id)">×</button>
            </div>
            <!-- Botón agregar pestaña -->
            <button class="vs-tab-add" title="Nuevo análisis" @click="newTab">+</button>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             WORKSPACE: árbol | tabs | constructor
        ════════════════════════════════════════════════════════════════ -->
        <div class="vs-workspace">

            <!-- ── DOCK IZQUIERDO: Árbol de proceso ───────────────────── -->
            <div
                class="vs-dock vs-dock-left"
                :style="leftOpen ? `width:${LEFT_W}px` : 'width:28px'"
            >
                <!-- Collapsed: pestaña vertical -->
                <div v-if="!leftOpen" class="vs-dock-collapsed" @click="leftOpen = true">
                    <span>Árbol de Proceso</span>
                </div>

                <!-- Open: contenido -->
                <div v-else class="vs-dock-content h-full">
                    <ProcessTreeDock @add-tag="addTag" />
                </div>
            </div>

            <!-- ── ÁREA CENTRAL: análisis con tabs ────────────────────── -->
            <div class="vs-center flex-1">
                <TrendAnalysis
                    v-if="activeTab"
                    :key="activeId"
                    :tags="activeTab.tags"
                    :calc-vars="activeTab.calcVars"
                    :range="activeTab.range"
                    @remove-tag="removeTag"
                />
            </div>

            <!-- ── DOCK DERECHO: Constructor de variables ─────────────── -->
            <div
                class="vs-dock vs-dock-right"
                :style="rightOpen ? `width:${RIGHT_W}px` : 'width:28px'"
            >
                <!-- Collapsed -->
                <div v-if="!rightOpen" class="vs-dock-collapsed" @click="rightOpen = true">
                    <span>Constructor de Variables</span>
                </div>

                <!-- Open -->
                <div v-else class="vs-dock-content h-full overflow-y-auto">
                    <VarBuilderDock
                        v-if="activeTab"
                        :tags="activeTab.tags"
                        :range="activeTab.range"
                        @add-calc-var="addCalcVar"
                        @remove-calc-var="removeCalcVar"
                    />
                </div>
            </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             STATUS BAR
        ════════════════════════════════════════════════════════════════ -->
        <div class="vs-statusbar">
            <span><i class="pi pi-database" /> andoraDB</span>
            <span class="vs-stbar-sep" />
            <span><i class="pi pi-tag" /> Tags: {{ activeTagCount }}/8</span>
            <span class="vs-stbar-sep" />
            <span><i class="pi pi-clock" /> Rango: {{ activeTab?.range }}</span>
            <span class="vs-stbar-sep" />
            <span><i class="pi pi-table" /> Análisis: {{ tabs.length }}</span>
            <span class="vs-stbar-right">
                anDora Process Historian v1.0  ·  DevExtreme {{ '25.2' }}
            </span>
        </div>
    </div>
</template>

<style scoped>
/* ══════════════════════════════════════════════════════════════════════════════
   Visual Studio style layout
   ══════════════════════════════════════════════════════════════════════════════ */

.vs-root {
    display: flex; flex-direction: column;
    height: calc(100vh - 110px);
    border: 1px solid var(--p-surface-300);
    border-radius: 4px;
    overflow: hidden;
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.8rem;
    background: var(--p-surface-0);
}

/* ── Title bar ─────────────────────────────────────────────────────────────── */
.vs-titlebar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 10px;
    background: var(--p-primary-color, #3b82f6);
    color: #fff; font-size: 0.72rem;
    min-height: 28px;
}
.vs-logo      { font-size: 1rem; margin-right: 4px; }
.vs-app-name  { font-weight: 700; letter-spacing: 0.02em; }
.vs-sep       { margin: 0 8px; opacity: 0.5; }
.vs-subtitle  { opacity: 0.85; }
.vs-titlebar-right { display: flex; align-items: center; gap: 5px; opacity: 0.85; font-family: monospace; }
.vs-clock     { font-size: 0.68rem; }

/* ── Main toolbar ──────────────────────────────────────────────────────────── */
.vs-toolbar {
    display: flex; align-items: center; gap: 1px;
    padding: 2px 6px;
    background: var(--p-surface-100);
    border-bottom: 1px solid var(--p-surface-300);
    min-height: 32px;
}
.vs-tbtn {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 24px; border: none; border-radius: 3px;
    background: transparent; cursor: pointer; color: var(--p-text-color);
    font-size: 0.78rem; padding: 0;
}
.vs-tbtn:hover      { background: var(--p-surface-200); }
.vs-tbtn-active     { background: var(--p-primary-50, #eff6ff); color: var(--p-primary-color); }

.vs-range-btn { width: auto; padding: 0 7px; font-size: 0.68rem; font-weight: 600; }

.vs-tbsep     { width: 1px; height: 18px; background: var(--p-surface-300); margin: 0 4px; }
.vs-tblabel   { font-size: 0.68rem; color: var(--p-text-muted-color); padding: 0 3px; }

.vs-tag-counter {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.68rem; color: var(--p-text-muted-color);
    padding: 0 8px;
}

/* ── Tabs bar ──────────────────────────────────────────────────────────────── */
.vs-tabbar {
    display: flex; align-items: flex-end;
    background: var(--p-surface-200);
    border-bottom: 1px solid var(--p-surface-300);
    padding: 0 4px; padding-top: 3px;
    overflow-x: auto; min-height: 30px;
}
.vs-tab {
    display: flex; align-items: center; gap: 4px;
    padding: 4px 10px 4px 8px;
    border: 1px solid transparent; border-bottom: none;
    border-radius: 3px 3px 0 0;
    background: var(--p-surface-100);
    cursor: pointer; font-size: 0.72rem;
    margin-right: 2px; white-space: nowrap;
    color: var(--p-text-muted-color);
}
.vs-tab:hover          { background: var(--p-surface-0); color: var(--p-text-color); }
.vs-tab-active {
    background: var(--p-surface-0) !important;
    color: var(--p-text-color) !important;
    border-color: var(--p-surface-300);
    font-weight: 600;
}
.vs-tab-icon  { font-size: 0.7rem; color: var(--p-primary-color); }
.vs-tab-badge {
    background: var(--p-primary-color); color: #fff;
    border-radius: 8px; font-size: 0.6rem; padding: 0 5px; font-weight: 700;
}
.vs-tab-close {
    background: none; border: none; cursor: pointer;
    font-size: 0.85rem; line-height: 1; color: var(--p-text-muted-color);
    padding: 0 1px; border-radius: 2px; margin-left: 2px;
}
.vs-tab-close:hover { background: #ef4444; color: #fff; }
.vs-tab-add {
    background: none; border: none; cursor: pointer;
    font-size: 1.1rem; color: var(--p-text-muted-color);
    padding: 0 8px; align-self: center;
}
.vs-tab-add:hover { color: var(--p-primary-color); }

/* ── Workspace ─────────────────────────────────────────────────────────────── */
.vs-workspace {
    display: flex; flex: 1; min-height: 0; overflow: hidden;
}

/* ── Docks ─────────────────────────────────────────────────────────────────── */
.vs-dock {
    display: flex; flex-direction: column;
    border-right: 1px solid var(--p-surface-300);
    background: var(--p-surface-50);
    transition: width 0.2s ease;
    overflow: hidden; min-height: 0;
}
.vs-dock-right { border-right: none; border-left: 1px solid var(--p-surface-300); }

.vs-dock-collapsed {
    display: flex; align-items: center; justify-content: center;
    height: 100%; cursor: pointer;
    writing-mode: vertical-rl; text-orientation: mixed;
    font-size: 0.68rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--p-text-muted-color); padding: 10px 0;
    background: var(--p-surface-100);
    border-right: 2px solid var(--p-primary-color);
}
.vs-dock-right .vs-dock-collapsed {
    border-right: none; border-left: 2px solid var(--p-primary-color);
}
.vs-dock-collapsed:hover { color: var(--p-primary-color); background: var(--p-surface-200); }

.vs-dock-content { display: flex; flex-direction: column; width: 100%; overflow: hidden; }

/* ── Centro ────────────────────────────────────────────────────────────────── */
.vs-center { overflow: hidden; min-height: 0; }

/* ── Status bar ────────────────────────────────────────────────────────────── */
.vs-statusbar {
    display: flex; align-items: center; gap: 8px;
    padding: 2px 10px;
    background: var(--p-primary-color, #3b82f6);
    color: rgba(255,255,255,0.9);
    font-size: 0.65rem; min-height: 20px;
}
.vs-stbar-sep { width: 1px; height: 10px; background: rgba(255,255,255,0.3); }
.vs-stbar-right { margin-left: auto; opacity: 0.7; }
</style>
