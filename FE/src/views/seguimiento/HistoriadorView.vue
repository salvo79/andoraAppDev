<script setup>
import ProcessTreeDock  from '@/components/historiador/ProcessTreeDock.vue';
import TrendAnalysis    from '@/components/historiador/TrendAnalysis.vue';
import VarBuilderDock   from '@/components/historiador/VarBuilderDock.vue';
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore }    from '@/stores/authStore.js';
import historianService    from '@/service/historianService.js';
import { operationsService } from '@/service/operationsService.js';
import api                 from '@/service/api.js';

const authStore = useAuthStore();

// ══════════════════════════════════════════════════════════════════════════════
// ATLAS CONNECTION STATUS
// ══════════════════════════════════════════════════════════════════════════════
const atlasStatus = ref('connecting'); // 'connecting' | 'connected' | 'error'
let atlasTimer = null;

async function checkAtlas(initial = false) {
    if (initial) atlasStatus.value = 'connecting';
    try {
        await api.get('/health/atlas', { timeout: 6000 });
        atlasStatus.value = 'connected';
    } catch {
        atlasStatus.value = 'error';
    }
}

const atlasLabel = computed(() => ({
    connecting: 'Conectando...',
    connected:  'andoraDB · Atlas',
    error:      'andoraDB · Sin conexión',
}[atlasStatus.value]));

const atlasIcon = computed(() => ({
    connecting: 'pi pi-spin pi-spinner',
    connected:  'pi pi-database',
    error:      'pi pi-times-circle',
}[atlasStatus.value]));

// ══════════════════════════════════════════════════════════════════════════════
// DOCKS
// ══════════════════════════════════════════════════════════════════════════════
const leftOpen  = ref(true);
const rightOpen = ref(true);
const LEFT_W    = 240;
const RIGHT_W   = 270;

// ══════════════════════════════════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════════════════════════════════
let tabCounter = 1;
const tabs = ref([
    { id: 1, dbId: null, title: 'Análisis 1', description: '', status: 'draft', isShared: false, sharedWith: [], tags: [], calcVars: [], range: '1d', operMetrics: [] },
]);
const activeId  = ref(1);
const activeTab = computed(() => tabs.value.find(t => t.id === activeId.value));

function activateTab(id) { activeId.value = id; }

function closeTab(id) {
    const idx = tabs.value.findIndex(t => t.id === id);
    tabs.value = tabs.value.filter(t => t.id !== id);
    if (!tabs.value.length) {
        tabCounter++;
        tabs.value = [{ id: tabCounter, dbId: null, title: 'Análisis 1', description: '', status: 'draft', isShared: false, sharedWith: [], tags: [], calcVars: [], range: '1d', operMetrics: [] }];
    }
    activeId.value = tabs.value[Math.min(idx, tabs.value.length - 1)].id;
}

// ══════════════════════════════════════════════════════════════════════════════
// RANGO TEMPORAL
// ══════════════════════════════════════════════════════════════════════════════
const RANGES = [
    { label: '1d',   value: '1d'  },
    { label: '7d',   value: '7d'  },
    { label: '1m',   value: '1mo' },
    { label: '1a',   value: '1y'  },
    { label: 'Todo', value: 'all' },
];

function setRange(r) {
    if (activeTab.value) activeTab.value.range = r;
}

// ══════════════════════════════════════════════════════════════════════════════
// TAGS Y VARIABLES CALCULADAS
// ══════════════════════════════════════════════════════════════════════════════
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

function clearAnalysis() {
    if (!activeTab.value) return;
    activeTab.value.tags        = [];
    activeTab.value.calcVars    = [];
    activeTab.value.operMetrics = [];
}

// ══════════════════════════════════════════════════════════════════════════════
// MÉTRICAS OPERATIVAS (Producción / Compras / Ventas desde Atlas)
// ══════════════════════════════════════════════════════════════════════════════
const metricLoading = ref(false);

async function addMetric(metricData) {
    const tab = activeTab.value;
    if (!tab) return;
    if (!tab.operMetrics) tab.operMetrics = [];
    if (tab.operMetrics.find(m => m.key === metricData.key)) return;
    if ((tab.tags.length + tab.operMetrics.length) >= 8) return;

    metricLoading.value = true;
    try {
        const series = await operationsService.getSeries(
            metricData.operData.source,
            metricData.operData,
            tab.range,
        );
        tab.operMetrics = [...tab.operMetrics, {
            key:      metricData.key,
            label:    metricData.label,
            unidad:   metricData.operData.unidad || '',
            tipo:     'OPR',
            operData: metricData.operData,
            series,
        }];
    } finally {
        metricLoading.value = false;
    }
}

function removeMetric(key) {
    const tab = activeTab.value;
    if (!tab) return;
    tab.operMetrics = (tab.operMetrics || []).filter(m => m.key !== key);
}

// Refetch series cuando cambia el rango
watch(() => activeTab.value?.range, async (newRange) => {
    const tab = activeTab.value;
    if (!tab?.operMetrics?.length || !newRange) return;
    for (const m of tab.operMetrics) {
        m.series = await operationsService.getSeries(m.operData.source, m.operData, newRange);
    }
});

// Drop zone: recibe métricas arrastradas desde el árbol de operaciones
function onMetricDrop(e) {
    const raw = e.dataTransfer.getData('application/andora-metric');
    if (!raw) return;
    try {
        addMetric(JSON.parse(raw));
    } catch { /* ignore malformed data */ }
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTO-SAVE
// ══════════════════════════════════════════════════════════════════════════════
const saveStatus = ref('idle'); // 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'
let saveTimer = null;

async function doSave(tab) {
    saveStatus.value = 'saving';
    try {
        // Serializa operMetrics como tags con type='operacion' (sin la serie de datos)
        const operAsTag = (tab.operMetrics || []).map(m => ({
            key:      m.key,
            label:    m.label,
            type:     'operacion',
            data:     null,
            operData: m.operData,
        }));
        const res = await historianService.save({
            id:          tab.dbId || undefined,
            name:        tab.title,
            description: tab.description || '',
            status:      tab.status      || 'draft',
            isShared:    tab.isShared    || false,
            sharedWith:  tab.sharedWith  || [],
            range:       tab.range,
            tags:        [...tab.tags, ...operAsTag],
            calcVars:    tab.calcVars || [],
        });
        if (!tab.dbId) tab.dbId = res.id;
        saveStatus.value = 'saved';
        historianService.getAll().then(r => { library.value = r; }).catch(() => {});
    } catch {
        saveStatus.value = 'error';
    }
}

watch(tabs, () => {
    const tab = activeTab.value;
    if (!tab?.dbId) return;
    saveStatus.value = 'unsaved';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => doSave(tab), 1500);
}, { deep: true });

// ══════════════════════════════════════════════════════════════════════════════
// DIALOG: NUEVO ANÁLISIS
// ══════════════════════════════════════════════════════════════════════════════
const showNewTabDialog = ref(false);
const newTabForm       = ref({ name: '', description: '', status: 'draft', isShared: false });

function newTab() {
    tabCounter++;
    newTabForm.value = { name: `Análisis ${tabCounter}`, description: '', status: 'draft', isShared: false };
    showNewTabDialog.value = true;
}

async function confirmNewTab() {
    const tab = {
        id:          tabCounter,
        dbId:        null,
        title:       newTabForm.value.name.trim() || `Análisis ${tabCounter}`,
        description: newTabForm.value.description.trim(),
        status:      newTabForm.value.status,
        isShared:    newTabForm.value.isShared,
        sharedWith:  [],
        tags:        [],
        calcVars:    [],
        range:       '1d',
    };
    tabs.value.push(tab);
    activeId.value = tab.id;
    showNewTabDialog.value = false;
    await doSave(tab);
}

function cancelNewTab() {
    tabCounter--;
    showNewTabDialog.value = false;
}

// ══════════════════════════════════════════════════════════════════════════════
// DIALOG: GUARDAR ANÁLISIS LOCAL (sin dbId)
// ══════════════════════════════════════════════════════════════════════════════
const showSaveCurrent = ref(false);
const saveCurrentForm = ref({ name: '', description: '', status: 'draft', isShared: false });

function promptSaveCurrent() {
    const tab = activeTab.value;
    if (!tab || tab.dbId) return;
    saveCurrentForm.value = { name: tab.title, description: tab.description || '', status: tab.status || 'draft', isShared: tab.isShared || false };
    showSaveCurrent.value = true;
}

async function confirmSaveCurrent() {
    const tab = activeTab.value;
    if (!tab) return;
    tab.title       = saveCurrentForm.value.name.trim() || tab.title;
    tab.description = saveCurrentForm.value.description.trim();
    tab.status      = saveCurrentForm.value.status;
    tab.isShared    = saveCurrentForm.value.isShared;
    showSaveCurrent.value = false;
    await doSave(tab);
}

// ══════════════════════════════════════════════════════════════════════════════
// BIBLIOTECA DE ANÁLISIS (MongoDB Atlas)
// ══════════════════════════════════════════════════════════════════════════════
const showLibrary = ref(false);
const library     = ref([]);
const libLoading  = ref(false);

onMounted(async () => {
    libLoading.value = true;
    try { library.value = await historianService.getAll(); }
    catch { /* no critico */ }
    finally { libLoading.value = false; }

    // Verifica conexión a Atlas al montar y luego cada 30 segundos
    checkAtlas(true);
    atlasTimer = setInterval(() => checkAtlas(), 30_000);
});

onUnmounted(() => {
    clearInterval(atlasTimer);
});

function openFromLibrary(saved) {
    const existing = tabs.value.find(t => t.dbId === saved.id);
    if (existing) {
        activeId.value    = existing.id;
        showLibrary.value = false;
        return;
    }
    tabCounter++;
    // Separar tags de proceso de métricas operativas guardadas
    const allTags     = saved.tags || [];
    const processTags = allTags.filter(t => t.type !== 'operacion');
    const savedOper   = allTags.filter(t => t.type === 'operacion');
    const tab = {
        id:          tabCounter,
        dbId:        saved.id,
        title:       saved.name,
        description: saved.description || '',
        status:      saved.status      || 'draft',
        isShared:    saved.isShared,
        sharedWith:  saved.sharedWith  || [],
        tags:        processTags,
        calcVars:    saved.calcVars    || [],
        range:       saved.range       || '1d',
        operMetrics: [],
    };
    tabs.value.push(tab);
    activeId.value    = tab.id;
    showLibrary.value = false;
    saveStatus.value  = 'saved';
    // Refetch series para métricas operativas guardadas (async, no bloquea)
    savedOper.forEach(async (m) => {
        try {
            const series = await operationsService.getSeries(m.operData.source, m.operData, tab.range);
            tab.operMetrics = [...tab.operMetrics, { key: m.key, label: m.label, unidad: m.operData?.unidad || '', tipo: 'OPR', operData: m.operData, series }];
        } catch { /* ignora silenciosamente */ }
    });
}

// ── Publicar análisis (draft → published) ─────────────────────────────────────
async function publishFromLibrary(id) {
    await historianService.publish(id);
    const entry = library.value.find(a => a.id === id);
    if (entry) entry.status = 'published';
    const tab = tabs.value.find(t => t.dbId === id);
    if (tab) tab.status = 'published';
}

// ── Compartir con usuario específico ──────────────────────────────────────────
const showShareDialog   = ref(false);
const shareTarget       = ref(null);   // el análisis que se está compartiendo
const shareUsername     = ref('');
const shareError        = ref('');

function openShareDialog(a) {
    shareTarget.value   = { ...a, sharedWith: [...(a.sharedWith || [])] };
    shareUsername.value = '';
    shareError.value    = '';
    showShareDialog.value = true;
}

async function addSharedUser() {
    const u = shareUsername.value.trim();
    if (!u) return;
    if (shareTarget.value.sharedWith.includes(u)) {
        shareError.value = 'Ya tiene acceso';
        return;
    }
    shareTarget.value.sharedWith.push(u);
    shareUsername.value = '';
    shareError.value    = '';
}

function removeSharedUser(u) {
    shareTarget.value.sharedWith = shareTarget.value.sharedWith.filter(x => x !== u);
}

async function confirmShare() {
    const a = shareTarget.value;
    await historianService.save({
        id:         a.id,
        name:       a.name,
        description: a.description,
        status:     a.status,
        isShared:   a.isShared,
        sharedWith: a.sharedWith,
        range:      a.range,
        tags:       a.tags,
        calcVars:   a.calcVars,
    });
    // actualizar referencia en library y en tab abierta
    const entry = library.value.find(x => x.id === a.id);
    if (entry) { entry.isShared = a.isShared; entry.sharedWith = [...a.sharedWith]; }
    const tab = tabs.value.find(t => t.dbId === a.id);
    if (tab) { tab.isShared = a.isShared; tab.sharedWith = [...a.sharedWith]; }
    showShareDialog.value = false;
}

// ── Filtro de biblioteca ──────────────────────────────────────────────────────
const libFilter = ref('all'); // 'all' | 'mine-draft' | 'mine-published' | 'shared'

const filteredLibrary = computed(() => {
    switch (libFilter.value) {
        case 'mine-draft':
            return library.value.filter(a => a.ownerUsername === authStore.user && a.status === 'draft');
        case 'mine-published':
            return library.value.filter(a => a.ownerUsername === authStore.user && a.status === 'published');
        case 'shared':
            return library.value.filter(a => a.ownerUsername !== authStore.user);
        default:
            return library.value;
    }
});

async function deleteFromLibrary(id) {
    try {
        await historianService.remove(id);
        library.value = library.value.filter(a => a.id !== id);
        const tab = tabs.value.find(t => t.dbId === id);
        if (tab) closeTab(tab.id);
    } catch { /* handle */ }
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const activeTagCount = computed(() =>
    (activeTab.value?.tags?.length ?? 0) + (activeTab.value?.calcVars?.length ?? 0)
);

const saveStatusLabel = computed(() => ({
    idle:    '',
    unsaved: 'Sin guardar',
    saving:  'Guardando...',
    saved:   'Guardado',
    error:   'Error al guardar',
}[saveStatus.value] ?? ''));

const saveStatusIcon = computed(() => ({
    idle:    '',
    unsaved: 'pi pi-circle-fill',
    saving:  'pi pi-spin pi-spinner',
    saved:   'pi pi-check',
    error:   'pi pi-times',
}[saveStatus.value] ?? ''));

function fmtNow() {
    return new Date().toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}
const now = ref(fmtNow());
setInterval(() => (now.value = fmtNow()), 1000);

function fmtDate(d) {
    return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
</script>

<template>
    <div class="vs-root">

        <!-- ════════════════════════════════════════════════════════════════
             TITLE BAR
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
             MAIN TOOLBAR
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
            <button v-for="r in RANGES" :key="r.label"
                    class="vs-tbtn vs-range-btn"
                    :class="activeTab?.range === r.value ? 'vs-tbtn-active' : ''"
                    @click="setRange(r.value)">{{ r.label }}</button>

            <div class="vs-tbsep" />

            <!-- Biblioteca -->
            <button class="vs-tbtn" title="Mis análisis guardados (Atlas)" @click="showLibrary = true">
                <i class="pi pi-folder-open" />
            </button>

            <!-- Nuevo análisis -->
            <button class="vs-tbtn" title="Nuevo análisis" @click="newTab">
                <i class="pi pi-plus" />
            </button>

            <!-- Guardar análisis actual -->
            <button class="vs-tbtn"
                    :class="activeTab?.dbId ? 'vs-tbtn-saved' : 'vs-tbtn-save-pending'"
                    :title="activeTab?.dbId ? 'Guardado en Atlas' : 'Guardar en Atlas'"
                    @click="promptSaveCurrent">
                <i class="pi pi-save" />
            </button>

            <!-- Limpiar análisis -->
            <button class="vs-tbtn" title="Limpiar análisis" @click="clearAnalysis">
                <i class="pi pi-trash" />
            </button>

            <div style="flex:1" />

            <!-- Indicador de guardado -->
            <div v-if="saveStatus !== 'idle'" class="vs-save-status" :class="'vs-ss-' + saveStatus">
                <i :class="saveStatusIcon" />
                <span>{{ saveStatusLabel }}</span>
            </div>

            <!-- Contador de variables -->
            <div class="vs-tag-counter">
                <i class="pi pi-chart-line" />
                {{ activeTagCount }} / 8 variables
            </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             TABS BAR
        ════════════════════════════════════════════════════════════════ -->
        <div class="vs-tabbar">
            <div v-for="tab in tabs" :key="tab.id"
                 class="vs-tab"
                 :class="{ 'vs-tab-active': tab.id === activeId }"
                 @click="activateTab(tab.id)">
                <i class="pi pi-chart-line vs-tab-icon" />
                <span class="vs-tab-title">{{ tab.title }}</span>
                <i v-if="tab.dbId" class="pi pi-cloud vs-tab-cloud" title="Guardado en Atlas" />
                <span v-if="(tab.tags?.length || 0) + (tab.calcVars?.length || 0)"
                      class="vs-tab-badge">
                    {{ (tab.tags?.length || 0) + (tab.calcVars?.length || 0) }}
                </span>
                <button class="vs-tab-close" @click.stop="closeTab(tab.id)">×</button>
            </div>
            <button class="vs-tab-add" title="Nuevo análisis" @click="newTab">+</button>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             WORKSPACE
        ════════════════════════════════════════════════════════════════ -->
        <div class="vs-workspace">

            <!-- Dock izquierdo: Árbol de proceso -->
            <div class="vs-dock vs-dock-left"
                 :style="leftOpen ? `width:${LEFT_W}px` : 'width:28px'">
                <div v-if="!leftOpen" class="vs-dock-collapsed" @click="leftOpen = true">
                    <span>Árbol de Proceso</span>
                </div>
                <div v-else class="vs-dock-content h-full">
                    <ProcessTreeDock
                        @add-tag="addTag"
                    />
                </div>
            </div>

            <!-- Centro: análisis (también es drop zone para métricas operativas) -->
            <div class="vs-center flex-1"
                 @dragover.prevent
                 @drop="onMetricDrop">
                <TrendAnalysis
                    v-if="activeTab"
                    :key="activeId"
                    :tags="activeTab.tags"
                    :calc-vars="activeTab.calcVars"
                    :oper-metrics="activeTab.operMetrics || []"
                    :range="activeTab.range"
                    @remove-tag="removeTag"
                    @remove-metric="removeMetric"
                />
                <!-- Indicador de carga de métrica -->
                <div v-if="metricLoading" class="vs-metric-loading">
                    <i class="pi pi-spin pi-spinner" /> Cargando datos de Atlas...
                </div>
            </div>

            <!-- Dock derecho: Constructor de variables -->
            <div class="vs-dock vs-dock-right"
                 :style="rightOpen ? `width:${RIGHT_W}px` : 'width:28px'">
                <div v-if="!rightOpen" class="vs-dock-collapsed" @click="rightOpen = true">
                    <span>Constructor de Variables</span>
                </div>
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
            <span class="vs-atlas-badge" :class="`vs-atlas-${atlasStatus}`">
                <span class="vs-atlas-dot" />
                <i :class="atlasIcon" />
                {{ atlasLabel }}
            </span>
            <span class="vs-stbar-sep" />
            <span><i class="pi pi-tag" /> Tags: {{ activeTagCount }}/8</span>
            <span class="vs-stbar-sep" />
            <span><i class="pi pi-clock" /> Rango: {{ activeTab?.range }}</span>
            <span class="vs-stbar-sep" />
            <span><i class="pi pi-table" /> Análisis: {{ tabs.length }}</span>
            <span v-if="activeTab?.isShared" class="vs-stbar-sep" />
            <span v-if="activeTab?.isShared"><i class="pi pi-share-alt" /> Compartido</span>
            <span class="vs-stbar-right">
                anDora Process Historian v1.0  ·  DevExtreme {{ '25.2' }}
            </span>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             DIALOG: NUEVO ANÁLISIS
        ════════════════════════════════════════════════════════════════ -->
        <div v-if="showNewTabDialog" class="vs-overlay" @click.self="cancelNewTab">
            <div class="vs-dialog">
                <div class="vs-dialog-header">
                    <i class="pi pi-plus-circle" />
                    <span>Nuevo Análisis</span>
                </div>
                <div class="vs-dialog-body">
                    <label class="vs-dlabel">Nombre</label>
                    <input v-model="newTabForm.name" class="vs-dinput"
                           placeholder="Nombre del análisis"
                           @keyup.enter="confirmNewTab" />

                    <label class="vs-dlabel">Descripción</label>
                    <textarea v-model="newTabForm.description" class="vs-dtextarea" rows="3"
                              placeholder="Descripción opcional..." />

                    <label class="vs-dlabel" style="margin-top:4px">Estado inicial</label>
                    <div class="vs-dstatus-row">
                        <label class="vs-dstatus-opt" :class="newTabForm.status === 'draft' ? 'vs-dstatus-sel' : ''">
                            <input type="radio" v-model="newTabForm.status" value="draft" />
                            <i class="pi pi-pencil" /> En desarrollo
                        </label>
                        <label class="vs-dstatus-opt" :class="newTabForm.status === 'published' ? 'vs-dstatus-sel vs-dstatus-pub' : ''">
                            <input type="radio" v-model="newTabForm.status" value="published" />
                            <i class="pi pi-check-circle" /> Publicado
                        </label>
                    </div>

                    <label class="vs-dcheck">
                        <input type="checkbox" v-model="newTabForm.isShared" />
                        <span>Compartir con mi empresa</span>
                        <i class="pi pi-share-alt" style="opacity:.5;font-size:.7rem;margin-left:4px" />
                    </label>
                </div>
                <div class="vs-dialog-footer">
                    <button class="vs-dbtn vs-dbtn-ghost" @click="cancelNewTab">Cancelar</button>
                    <button class="vs-dbtn vs-dbtn-primary" @click="confirmNewTab">
                        <i class="pi pi-cloud-upload" /> Crear y guardar
                    </button>
                </div>
            </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             DIALOG: GUARDAR ANÁLISIS LOCAL
        ════════════════════════════════════════════════════════════════ -->
        <div v-if="showSaveCurrent" class="vs-overlay" @click.self="showSaveCurrent = false">
            <div class="vs-dialog">
                <div class="vs-dialog-header">
                    <i class="pi pi-cloud-upload" />
                    <span>Guardar en Atlas</span>
                </div>
                <div class="vs-dialog-body">
                    <label class="vs-dlabel">Nombre</label>
                    <input v-model="saveCurrentForm.name" class="vs-dinput"
                           @keyup.enter="confirmSaveCurrent" />

                    <label class="vs-dlabel">Descripción</label>
                    <textarea v-model="saveCurrentForm.description" class="vs-dtextarea" rows="3" />

                    <label class="vs-dlabel" style="margin-top:4px">Estado</label>
                    <div class="vs-dstatus-row">
                        <label class="vs-dstatus-opt" :class="saveCurrentForm.status === 'draft' ? 'vs-dstatus-sel' : ''">
                            <input type="radio" v-model="saveCurrentForm.status" value="draft" />
                            <i class="pi pi-pencil" /> En desarrollo
                        </label>
                        <label class="vs-dstatus-opt" :class="saveCurrentForm.status === 'published' ? 'vs-dstatus-sel vs-dstatus-pub' : ''">
                            <input type="radio" v-model="saveCurrentForm.status" value="published" />
                            <i class="pi pi-check-circle" /> Publicado
                        </label>
                    </div>

                    <label class="vs-dcheck">
                        <input type="checkbox" v-model="saveCurrentForm.isShared" />
                        <span>Compartir con mi empresa</span>
                        <i class="pi pi-share-alt" style="opacity:.5;font-size:.7rem;margin-left:4px" />
                    </label>
                </div>
                <div class="vs-dialog-footer">
                    <button class="vs-dbtn vs-dbtn-ghost" @click="showSaveCurrent = false">Cancelar</button>
                    <button class="vs-dbtn vs-dbtn-primary" @click="confirmSaveCurrent">
                        <i class="pi pi-cloud-upload" /> Guardar
                    </button>
                </div>
            </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             PANEL: BIBLIOTECA DE ANÁLISIS
        ════════════════════════════════════════════════════════════════ -->
        <div v-if="showLibrary" class="vs-overlay" @click.self="showLibrary = false">
            <div class="vs-library">
                <div class="vs-dialog-header">
                    <div style="display:flex;align-items:center;gap:8px">
                        <i class="pi pi-folder-open" />
                        <span>Biblioteca de Análisis</span>
                        <span class="vs-lib-count">{{ filteredLibrary.length }}</span>
                    </div>
                    <button class="vs-lib-close" @click="showLibrary = false">×</button>
                </div>

                <!-- Filtros -->
                <div class="vs-lib-filters">
                    <button class="vs-libf-btn" :class="libFilter === 'all'           ? 'vs-libf-active' : ''" @click="libFilter = 'all'">
                        <i class="pi pi-list" /> Todos
                    </button>
                    <button class="vs-libf-btn" :class="libFilter === 'mine-draft'    ? 'vs-libf-active' : ''" @click="libFilter = 'mine-draft'">
                        <i class="pi pi-pencil" /> En desarrollo
                    </button>
                    <button class="vs-libf-btn" :class="libFilter === 'mine-published'? 'vs-libf-active' : ''" @click="libFilter = 'mine-published'">
                        <i class="pi pi-check-circle" /> Publicados
                    </button>
                    <button class="vs-libf-btn" :class="libFilter === 'shared'        ? 'vs-libf-active' : ''" @click="libFilter = 'shared'">
                        <i class="pi pi-share-alt" /> Compartidos conmigo
                    </button>
                </div>

                <div class="vs-lib-body">
                    <!-- Cargando -->
                    <div v-if="libLoading" class="vs-lib-empty">
                        <i class="pi pi-spin pi-spinner" style="font-size:1.4rem" />
                        <span>Cargando desde Atlas...</span>
                    </div>

                    <!-- Sin análisis -->
                    <div v-else-if="!filteredLibrary.length" class="vs-lib-empty">
                        <i class="pi pi-inbox" style="font-size:2.2rem;opacity:.25" />
                        <p style="margin:8px 0 0;opacity:.5;font-size:.78rem">
                            {{ library.length ? 'Sin resultados en este filtro' : 'No hay análisis guardados' }}
                        </p>
                        <p v-if="!library.length" style="margin:2px 0 0;opacity:.4;font-size:.7rem">Usa "+" para crear y guardar uno</p>
                    </div>

                    <!-- Grid de análisis -->
                    <div v-else class="vs-lib-grid">
                        <div v-for="a in filteredLibrary" :key="a.id"
                             class="vs-lib-card" @click="openFromLibrary(a)">

                            <div class="vs-lc-top">
                                <i class="pi pi-chart-line vs-lc-icon" />
                                <div class="vs-lc-name">{{ a.name }}</div>

                                <!-- Badge de estado -->
                                <span class="vs-status-badge"
                                      :class="a.status === 'published' ? 'vs-status-pub' : 'vs-status-draft'">
                                    <i :class="a.status === 'published' ? 'pi pi-check-circle' : 'pi pi-pencil'" />
                                    {{ a.status === 'published' ? 'Publicado' : 'En desarrollo' }}
                                </span>

                                <!-- Badge compartido con empresa -->
                                <span v-if="a.isShared" class="vs-shared-badge">
                                    <i class="pi pi-building" /> Empresa
                                </span>
                                <!-- Badge compartido con usuarios específicos -->
                                <span v-if="a.sharedWith?.length" class="vs-shared-badge vs-shared-users">
                                    <i class="pi pi-users" /> {{ a.sharedWith.length }}
                                </span>
                            </div>

                            <div v-if="a.description" class="vs-lc-desc">{{ a.description }}</div>

                            <div class="vs-lc-meta">
                                <span><i class="pi pi-user" /> {{ a.ownerUsername }}</span>
                                <span><i class="pi pi-tag" /> {{ (a.tags?.length || 0) + (a.calcVars?.length || 0) }} vars</span>
                                <span><i class="pi pi-calendar" /> {{ fmtDate(a.updatedAt) }}</span>
                            </div>

                            <div class="vs-lc-actions">
                                <button class="vs-lc-open" @click.stop="openFromLibrary(a)">
                                    <i class="pi pi-external-link" /> Abrir
                                </button>

                                <!-- Publicar (solo propietario con status draft) -->
                                <button v-if="a.ownerUsername === authStore.user && a.status === 'draft'"
                                        class="vs-lc-publish"
                                        title="Publicar análisis"
                                        @click.stop="publishFromLibrary(a.id)">
                                    <i class="pi pi-check-circle" />
                                </button>

                                <!-- Compartir (solo propietario) -->
                                <button v-if="a.ownerUsername === authStore.user"
                                        class="vs-lc-share"
                                        title="Compartir con usuarios"
                                        @click.stop="openShareDialog(a)">
                                    <i class="pi pi-share-alt" />
                                </button>

                                <!-- Eliminar (solo propietario) -->
                                <button v-if="a.ownerUsername === authStore.user"
                                        class="vs-lc-del"
                                        title="Eliminar análisis"
                                        @click.stop="deleteFromLibrary(a.id)">
                                    <i class="pi pi-trash" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             DIALOG: COMPARTIR CON USUARIOS
        ════════════════════════════════════════════════════════════════ -->
        <div v-if="showShareDialog && shareTarget" class="vs-overlay" @click.self="showShareDialog = false">
            <div class="vs-dialog" style="min-width:420px">
                <div class="vs-dialog-header">
                    <i class="pi pi-share-alt" />
                    <span>Compartir — {{ shareTarget.name }}</span>
                </div>
                <div class="vs-dialog-body">

                    <!-- Compartir con toda la empresa -->
                    <label class="vs-dcheck" style="margin-bottom:10px">
                        <input type="checkbox" v-model="shareTarget.isShared" />
                        <i class="pi pi-building" style="color:var(--p-primary-color)" />
                        <span>Visible para toda mi empresa</span>
                    </label>

                    <!-- Compartir con usuarios específicos -->
                    <label class="vs-dlabel">Agregar usuarios específicos</label>
                    <div class="vs-share-input-row">
                        <input v-model="shareUsername" class="vs-dinput"
                               placeholder="Nombre de usuario..."
                               @keyup.enter="addSharedUser" />
                        <button class="vs-dbtn vs-dbtn-primary" style="white-space:nowrap"
                                @click="addSharedUser">
                            <i class="pi pi-plus" /> Agregar
                        </button>
                    </div>
                    <p v-if="shareError" style="color:#ef4444;font-size:.72rem;margin:2px 0">{{ shareError }}</p>

                    <!-- Lista de usuarios con acceso -->
                    <div v-if="shareTarget.sharedWith.length" class="vs-share-list">
                        <div v-for="u in shareTarget.sharedWith" :key="u" class="vs-share-user">
                            <i class="pi pi-user" style="color:var(--p-primary-color)" />
                            <span>{{ u }}</span>
                            <button class="vs-share-remove" @click="removeSharedUser(u)">
                                <i class="pi pi-times" />
                            </button>
                        </div>
                    </div>
                    <p v-else style="font-size:.72rem;opacity:.45;margin:6px 0">
                        Sin usuarios específicos aún
                    </p>
                </div>
                <div class="vs-dialog-footer">
                    <button class="vs-dbtn vs-dbtn-ghost" @click="showShareDialog = false">Cancelar</button>
                    <button class="vs-dbtn vs-dbtn-primary" @click="confirmShare">
                        <i class="pi pi-check" /> Guardar cambios
                    </button>
                </div>
            </div>
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
.vs-tbtn:hover        { background: var(--p-surface-200); }
.vs-tbtn-active       { background: var(--p-primary-50, #eff6ff); color: var(--p-primary-color); }
.vs-tbtn-save-pending { color: #f59e0b; }
.vs-tbtn-save-pending:hover { background: #fef3c7; }
.vs-tbtn-saved        { color: #22c55e; }

.vs-range-btn { width: auto; padding: 0 7px; font-size: 0.68rem; font-weight: 600; }
.vs-tbsep     { width: 1px; height: 18px; background: var(--p-surface-300); margin: 0 4px; }
.vs-tblabel   { font-size: 0.68rem; color: var(--p-text-muted-color); padding: 0 3px; }

/* ── Save status ───────────────────────────────────────────────────────────── */
.vs-save-status {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.68rem; padding: 0 8px; border-radius: 3px;
}
.vs-ss-saving  { color: var(--p-primary-color); }
.vs-ss-saved   { color: #22c55e; }
.vs-ss-unsaved { color: #f59e0b; }
.vs-ss-error   { color: #ef4444; }

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
.vs-tab:hover { background: var(--p-surface-0); color: var(--p-text-color); }
.vs-tab-active {
    background: var(--p-surface-0) !important;
    color: var(--p-text-color) !important;
    border-color: var(--p-surface-300);
    font-weight: 600;
}
.vs-tab-icon  { font-size: 0.7rem; color: var(--p-primary-color); }
.vs-tab-cloud { font-size: 0.6rem; color: #22c55e; opacity: 0.8; }
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
.vs-workspace { display: flex; flex: 1; min-height: 0; overflow: hidden; }

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

/* ── Centro / Status bar ───────────────────────────────────────────────────── */
.vs-center { overflow: hidden; min-height: 0; position: relative; }

.vs-metric-loading {
    position: absolute; bottom: 12px; right: 16px; z-index: 50;
    display: flex; align-items: center; gap: 6px;
    background: var(--p-primary-color); color: #fff;
    font-size: 0.72rem; padding: 5px 12px; border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    pointer-events: none;
}

.vs-statusbar {
    display: flex; align-items: center; gap: 8px;
    padding: 2px 10px;
    background: var(--p-primary-color, #3b82f6);
    color: rgba(255,255,255,0.9);
    font-size: 0.65rem; min-height: 20px;
}
.vs-stbar-sep   { width: 1px; height: 10px; background: rgba(255,255,255,0.3); }
.vs-stbar-right { margin-left: auto; opacity: 0.7; }

/* ── Atlas status badge ────────────────────────────────────────────────────── */
.vs-atlas-badge {
    display: flex; align-items: center; gap: 5px;
    padding: 1px 8px; border-radius: 10px;
    font-size: 0.65rem; font-weight: 600;
    transition: background 0.4s, color 0.4s;
}
.vs-atlas-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    transition: background 0.4s;
}

/* Verde — conectado */
.vs-atlas-connected {
    background: rgba(34, 197, 94, 0.18);
    color: #86efac;
}
.vs-atlas-connected .vs-atlas-dot {
    background: #22c55e;
    box-shadow: 0 0 5px #22c55e;
}

/* Naranja — conectando */
.vs-atlas-connecting {
    background: rgba(251, 146, 60, 0.18);
    color: #fdba74;
}
.vs-atlas-connecting .vs-atlas-dot {
    background: #f97316;
    animation: atlas-pulse 1s ease-in-out infinite;
}

/* Rojo — sin conexión */
.vs-atlas-error {
    background: rgba(239, 68, 68, 0.18);
    color: #fca5a5;
}
.vs-atlas-error .vs-atlas-dot {
    background: #ef4444;
    box-shadow: 0 0 5px #ef4444;
}

@keyframes atlas-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.75); }
}

/* ══════════════════════════════════════════════════════════════════════════════
   OVERLAY & DIALOGS
   ══════════════════════════════════════════════════════════════════════════════ */
.vs-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
}

.vs-dialog {
    background: var(--p-surface-0);
    border: 1px solid var(--p-surface-300);
    border-radius: 6px;
    min-width: 380px; max-width: 480px; width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    overflow: hidden;
}

.vs-dialog-header {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px;
    background: var(--p-primary-color);
    color: #fff; font-size: 0.78rem; font-weight: 700;
}

.vs-dialog-body {
    padding: 14px;
    display: flex; flex-direction: column; gap: 6px;
}

.vs-dlabel {
    font-size: 0.7rem; font-weight: 600;
    color: var(--p-text-muted-color);
    text-transform: uppercase; letter-spacing: 0.04em;
}

.vs-dinput {
    width: 100%; padding: 6px 9px;
    border: 1px solid var(--p-surface-300);
    border-radius: 4px;
    background: var(--p-surface-50);
    color: var(--p-text-color);
    font-size: 0.8rem;
    font-family: inherit;
    outline: none;
}
.vs-dinput:focus { border-color: var(--p-primary-color); }

.vs-dtextarea {
    width: 100%; padding: 6px 9px;
    border: 1px solid var(--p-surface-300);
    border-radius: 4px;
    background: var(--p-surface-50);
    color: var(--p-text-color);
    font-size: 0.78rem; font-family: inherit;
    resize: vertical; outline: none;
}
.vs-dtextarea:focus { border-color: var(--p-primary-color); }

.vs-dcheck {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.78rem; cursor: pointer; margin-top: 4px;
    color: var(--p-text-color);
}
.vs-dcheck input { cursor: pointer; }

.vs-dialog-footer {
    display: flex; justify-content: flex-end; gap: 8px;
    padding: 10px 14px;
    background: var(--p-surface-50);
    border-top: 1px solid var(--p-surface-200);
}

.vs-dbtn {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 4px;
    font-size: 0.75rem; font-weight: 600;
    cursor: pointer; border: 1px solid transparent;
    font-family: inherit;
}
.vs-dbtn-ghost   { background: transparent; border-color: var(--p-surface-300); color: var(--p-text-muted-color); }
.vs-dbtn-ghost:hover { background: var(--p-surface-200); }
.vs-dbtn-primary { background: var(--p-primary-color); color: #fff; border-color: var(--p-primary-color); }
.vs-dbtn-primary:hover { opacity: 0.88; }

/* ══════════════════════════════════════════════════════════════════════════════
   BIBLIOTECA DE ANÁLISIS
   ══════════════════════════════════════════════════════════════════════════════ */
.vs-library {
    background: var(--p-surface-0);
    border: 1px solid var(--p-surface-300);
    border-radius: 6px;
    width: 680px; max-width: 96vw;
    max-height: 80vh;
    display: flex; flex-direction: column;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    overflow: hidden;
}

.vs-lib-count {
    background: rgba(255,255,255,0.25);
    border-radius: 10px; font-size: 0.65rem;
    padding: 1px 7px; font-weight: 700;
}

.vs-lib-close {
    margin-left: auto;
    background: none; border: none; color: #fff;
    font-size: 1.3rem; cursor: pointer; line-height: 1;
    opacity: 0.8; padding: 0 2px; border-radius: 3px;
}
.vs-lib-close:hover { opacity: 1; background: rgba(255,255,255,0.15); }

.vs-lib-body {
    flex: 1; overflow-y: auto; padding: 14px;
    min-height: 0;
}

.vs-lib-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 160px;
    color: var(--p-text-muted-color); gap: 6px; font-size: 0.78rem;
}

.vs-lib-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 10px;
}

.vs-lib-card {
    border: 1px solid var(--p-surface-300);
    border-radius: 5px;
    padding: 10px 12px;
    background: var(--p-surface-50);
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    display: flex; flex-direction: column; gap: 5px;
}
.vs-lib-card:hover {
    border-color: var(--p-primary-color);
    box-shadow: 0 2px 12px rgba(59,130,246,0.12);
}

.vs-lc-top {
    display: flex; align-items: center; gap: 6px;
}
.vs-lc-icon { font-size: 0.82rem; color: var(--p-primary-color); flex-shrink: 0; }

.vs-lc-name {
    font-weight: 700; font-size: 0.8rem;
    color: var(--p-text-color); flex: 1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.vs-shared-badge {
    display: flex; align-items: center; gap: 3px;
    background: #eff6ff; color: var(--p-primary-color);
    border: 1px solid #bfdbfe;
    border-radius: 10px; font-size: 0.6rem;
    padding: 1px 6px; font-weight: 600; flex-shrink: 0;
}

.vs-lc-desc {
    font-size: 0.72rem; color: var(--p-text-muted-color);
    overflow: hidden; display: -webkit-box;
    -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical;
}

.vs-lc-meta {
    display: flex; gap: 10px; flex-wrap: wrap;
    font-size: 0.65rem; color: var(--p-text-muted-color);
}
.vs-lc-meta span { display: flex; align-items: center; gap: 3px; }

.vs-lc-actions {
    display: flex; gap: 6px; margin-top: 4px;
}
.vs-lc-open {
    display: flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 3px;
    background: var(--p-primary-color); color: #fff;
    border: none; font-size: 0.7rem; font-weight: 600;
    cursor: pointer; font-family: inherit; flex: 1;
    justify-content: center;
}
.vs-lc-open:hover { opacity: 0.85; }

.vs-lc-del {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 3px;
    background: transparent; border: 1px solid var(--p-surface-300);
    color: var(--p-text-muted-color); cursor: pointer;
    font-size: 0.7rem;
}
.vs-lc-del:hover { background: #fef2f2; border-color: #fca5a5; color: #ef4444; }

.vs-lc-publish {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 3px;
    background: transparent; border: 1px solid var(--p-surface-300);
    color: #22c55e; cursor: pointer; font-size: 0.7rem;
}
.vs-lc-publish:hover { background: #f0fdf4; border-color: #86efac; }

.vs-lc-share {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 3px;
    background: transparent; border: 1px solid var(--p-surface-300);
    color: var(--p-primary-color); cursor: pointer; font-size: 0.7rem;
}
.vs-lc-share:hover { background: #eff6ff; border-color: #93c5fd; }

/* ── Status badges ─────────────────────────────────────────────────────────── */
.vs-status-badge {
    display: flex; align-items: center; gap: 3px;
    border-radius: 10px; font-size: 0.6rem;
    padding: 1px 6px; font-weight: 600; flex-shrink: 0;
}
.vs-status-draft {
    background: #fef3c7; color: #92400e; border: 1px solid #fcd34d;
}
.vs-status-pub {
    background: #dcfce7; color: #166534; border: 1px solid #86efac;
}
.vs-shared-users {
    background: #ede9fe; color: #5b21b6; border-color: #c4b5fd;
}

/* ── Library filters ───────────────────────────────────────────────────────── */
.vs-lib-filters {
    display: flex; gap: 4px; padding: 8px 14px;
    border-bottom: 1px solid var(--p-surface-200);
    background: var(--p-surface-50);
    flex-wrap: wrap;
}
.vs-libf-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 12px;
    border: 1px solid var(--p-surface-300);
    background: transparent; cursor: pointer;
    font-size: 0.68rem; font-weight: 600;
    color: var(--p-text-muted-color); font-family: inherit;
}
.vs-libf-btn:hover { background: var(--p-surface-200); }
.vs-libf-active {
    background: var(--p-primary-50, #eff6ff) !important;
    border-color: var(--p-primary-color) !important;
    color: var(--p-primary-color) !important;
}

/* ── Dialog: status selector ───────────────────────────────────────────────── */
.vs-dstatus-row {
    display: flex; gap: 8px;
}
.vs-dstatus-opt {
    display: flex; align-items: center; gap: 5px;
    flex: 1; padding: 6px 10px;
    border: 1px solid var(--p-surface-300); border-radius: 4px;
    cursor: pointer; font-size: 0.75rem; color: var(--p-text-muted-color);
    background: var(--p-surface-50);
}
.vs-dstatus-opt input { display: none; }
.vs-dstatus-sel {
    border-color: #fcd34d; background: #fef3c7; color: #92400e;
}
.vs-dstatus-pub.vs-dstatus-sel {
    border-color: #86efac; background: #dcfce7; color: #166534;
}

/* ── Dialog: compartir ─────────────────────────────────────────────────────── */
.vs-share-input-row {
    display: flex; gap: 6px; align-items: center;
}
.vs-share-input-row .vs-dinput { flex: 1; }

.vs-share-list {
    display: flex; flex-direction: column; gap: 4px;
    margin-top: 6px; max-height: 160px; overflow-y: auto;
}
.vs-share-user {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 8px; border-radius: 4px;
    background: var(--p-surface-100);
    font-size: 0.75rem;
}
.vs-share-user span { flex: 1; }
.vs-share-remove {
    background: none; border: none; cursor: pointer;
    color: var(--p-text-muted-color); font-size: 0.7rem;
    padding: 2px; border-radius: 2px;
}
.vs-share-remove:hover { color: #ef4444; background: #fef2f2; }
</style>
