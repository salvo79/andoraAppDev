<script setup>
import SimpleTree from '@/components/shared/SimpleTree.vue';
import { onMounted, ref } from 'vue';
import { operationsService } from '@/service/operationsService.js';

const emit = defineEmits(['add-metric']);

const treeItems = ref([]);
const loading   = ref(true);
const error     = ref('');
const search    = ref('');

// ── Iconos y colores por tipo de nodo ──────────────────────────────────────
const SECTION_ICONS = {
    produccion: { icon: 'pi pi-chart-bar',    cls: 'opr-icon-prod' },
    compras:    { icon: 'pi pi-shopping-cart', cls: 'opr-icon-comp' },
    ventas:     { icon: 'pi pi-dollar',        cls: 'opr-icon-vent' },
};

const METRIC_ICONS = {
    cantidad:        { icon: 'pi pi-box',                    cls: 'opr-icon-prod' },
    cantidad_merma:  { icon: 'pi pi-exclamation-triangle',   cls: 'opr-icon-warn' },
    costo_total_mxn: { icon: 'pi pi-wallet',                 cls: 'opr-icon-comp' },
    costo_mxn:       { icon: 'pi pi-wallet',                 cls: 'opr-icon-comp' },
    precio_neto_mxn: { icon: 'pi pi-tag',                    cls: 'opr-icon-vent' },
};

function nodeIcon(item) {
    if (item.type === 'section')   return SECTION_ICONS[item.id] ?? { icon: 'pi pi-folder', cls: '' };
    if (item.type === 'planta')    return { icon: 'pi pi-building', cls: 'opr-icon-planta' };
    if (item.type === 'categoria') return { icon: 'pi pi-folder',   cls: 'opr-icon-cat' };
    if (item.type === 'metric')    return METRIC_ICONS[item.operData?.metrica] ?? { icon: 'pi pi-chart-line', cls: '' };
    return { icon: 'pi pi-circle', cls: '' };
}

// ── Carga de datos ──────────────────────────────────────────────────────────
onMounted(async () => {
    try {
        treeItems.value = await operationsService.getProcessTree();
    } catch {
        error.value = 'No se pudo cargar el árbol de operaciones';
    } finally {
        loading.value = false;
    }
});

// ── Drag & Drop ─────────────────────────────────────────────────────────────
function onDragStart(e, item) {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/andora-metric', JSON.stringify({
        key:      item.id,
        label:    item.text,
        operData: item.operData,
    }));
}

// ── Doble clic → emitir add-metric ─────────────────────────────────────────
function onNodeDblClick(node) {
    if (node.type === 'metric' && node.operData) {
        emit('add-metric', { key: node.id, label: node.text, operData: node.operData });
    }
}
</script>

<template>
    <div class="opdock flex flex-column h-full">

        <!-- Búsqueda -->
        <div class="opdock-search">
            <i class="pi pi-search opdock-search-icon" />
            <input
                v-model="search"
                class="opdock-search-input"
                placeholder="Buscar métrica..."
            />
        </div>

        <!-- Hint -->
        <div class="opdock-hint">
            <i class="pi pi-info-circle" />
            Doble clic o arrastrar al área de análisis
        </div>

        <!-- Cargando -->
        <div v-if="loading" class="opdock-center">
            <i class="pi pi-spin pi-spinner" /> Cargando desde Atlas...
        </div>

        <!-- Error -->
        <div v-else-if="error" class="opdock-center opdock-error">
            <i class="pi pi-times-circle" /> {{ error }}
        </div>

        <!-- Árbol -->
        <div v-else class="opdock-tree flex-1 overflow-auto">
            <SimpleTree
                :nodes="treeItems"
                :search-text="search"
                @node-dblclick="onNodeDblClick"
            >
                <template #default="{ node }">
                    <div
                        class="opr-node"
                        :class="[node.type, node.type === 'metric' ? 'opr-draggable' : '']"
                        :draggable="node.type === 'metric'"
                        @dragstart="node.type === 'metric' ? onDragStart($event, node) : $event.preventDefault()"
                    >
                        <i :class="[nodeIcon(node).icon, nodeIcon(node).cls, 'opr-icon']" />
                        <span class="opr-label">{{ node.text }}</span>
                        <span v-if="node.type === 'metric' && node.operData?.unidad"
                              class="opr-unit">{{ node.operData.unidad }}</span>
                        <i v-if="node.type === 'metric'" class="pi pi-arrows-alt opr-drag-hint" />
                    </div>
                </template>
            </SimpleTree>
        </div>

        <!-- Leyenda -->
        <div class="opdock-legend">
            <span class="legend-item"><i class="pi pi-chart-bar opr-icon-prod" /> Producción</span>
            <span class="legend-item"><i class="pi pi-shopping-cart opr-icon-comp" /> Compras</span>
            <span class="legend-item"><i class="pi pi-dollar opr-icon-vent" /> Ventas</span>
        </div>
    </div>
</template>

<style scoped>
.opdock { background: var(--p-surface-50); font-family: 'Segoe UI', system-ui, sans-serif; }

/* ── Búsqueda ──────────────────────────────────────────────────────────────── */
.opdock-search {
    position: relative; padding: 6px 8px;
    border-bottom: 1px solid var(--p-surface-200);
}
.opdock-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: var(--p-text-muted-color); font-size: 0.8rem; pointer-events: none;
}
.opdock-search-input {
    width: 100%; padding: 3px 6px 3px 24px;
    border: 1px solid var(--p-surface-300); border-radius: 3px;
    font-size: 0.75rem; background: var(--p-surface-0);
    color: var(--p-text-color); outline: none; box-sizing: border-box;
}
.opdock-search-input:focus { border-color: var(--p-primary-color); }

/* ── Hint ──────────────────────────────────────────────────────────────────── */
.opdock-hint {
    font-size: 0.65rem; color: var(--p-text-muted-color);
    padding: 3px 10px; border-bottom: 1px solid var(--p-surface-200);
    display: flex; align-items: center; gap: 4px;
}

/* ── Estados ───────────────────────────────────────────────────────────────── */
.opdock-center {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; flex: 1; font-size: 0.75rem;
    color: var(--p-text-muted-color); padding: 20px;
}
.opdock-error { color: #ef4444; }

/* ── Árbol ─────────────────────────────────────────────────────────────────── */
.opdock-tree { overflow-y: auto; }

/* ── Nodo ──────────────────────────────────────────────────────────────────── */
.opr-node {
    display: flex; align-items: center; gap: 5px;
    padding: 2px 0; font-size: 0.76rem; cursor: default;
}
.opr-node.metric { cursor: grab; }
.opr-node.metric:hover .opr-label { color: var(--p-primary-color); }
.opr-draggable:active { cursor: grabbing; }

.opr-icon   { font-size: 0.78rem; flex-shrink: 0; }
.opr-label  { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.opr-unit {
    font-size: 0.6rem; color: var(--p-text-muted-color);
    background: var(--p-surface-200); border-radius: 3px; padding: 0 4px; flex-shrink: 0;
}
.opr-drag-hint {
    font-size: 0.6rem; color: var(--p-surface-400);
    opacity: 0; transition: opacity 0.15s; flex-shrink: 0;
}
.opr-node.metric:hover .opr-drag-hint { opacity: 1; }

/* ── Colores por sección ───────────────────────────────────────────────────── */
.opr-icon-prod   { color: #10b981; }
.opr-icon-comp   { color: #f59e0b; }
.opr-icon-vent   { color: #3b82f6; }
.opr-icon-warn   { color: #ef4444; }
.opr-icon-planta { color: var(--p-primary-color); }
.opr-icon-cat    { color: var(--p-text-muted-color); }

.opr-node.section .opr-label { font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; }

/* ── Leyenda ───────────────────────────────────────────────────────────────── */
.opdock-legend {
    padding: 5px 10px; border-top: 1px solid var(--p-surface-200);
    font-size: 0.65rem; color: var(--p-text-muted-color);
    background: var(--p-surface-100);
    display: flex; gap: 10px; flex-wrap: wrap;
}
.legend-item { display: flex; align-items: center; gap: 3px; }
</style>
