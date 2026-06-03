<script setup>
import { PROCESS_TREE_LIST } from '@/service/seguimientoService';
import OperationsTreeDock from '@/components/historiador/OperationsTreeDock.vue';
import { DxTreeList, DxColumn, DxSearchPanel } from 'devextreme-vue/tree-list';
import { ref, computed } from 'vue';

const emit = defineEmits(['add-tag', 'add-metric']);

const activeTab = ref('tags');

const search = ref('');

const expandedKeys = ref(['__root__', 'sitio-norte', 'sitio-sur']);

// ── Iconos por tipo de nodo ───────────────────────────────────────────────────
const NODE_ICONS = {
    root:   { icon: 'pi pi-database',    cls: 'node-root'   },
    sitio:  { icon: 'pi pi-map-marker',  cls: 'node-sitio'  },
    planta: { icon: 'pi pi-building',    cls: 'node-planta' },
    area:   { icon: 'pi pi-sitemap',     cls: 'node-area'   },
    tag:    {
        T: { icon: 'pi pi-sun',          cls: 'node-tag-t' },
        P: { icon: 'pi pi-gauge',        cls: 'node-tag-p' },
        F: { icon: 'pi pi-arrow-right',  cls: 'node-tag-f' },
        L: { icon: 'pi pi-wave-pulse',   cls: 'node-tag-l' },
        A: { icon: 'pi pi-chart-line',   cls: 'node-tag-a' },
    },
};

function nodeIcon(item) {
    if (item.type !== 'tag') return NODE_ICONS[item.type] || NODE_ICONS.area;
    return NODE_ICONS.tag[item.tagData?.tipo] || NODE_ICONS.tag.A;
}

// ── Filtrado reactivo (mantiene ancestros visibles) ───────────────────────────
const filteredData = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return PROCESS_TREE_LIST;
    const matchIds = new Set();
    PROCESS_TREE_LIST.forEach(item => {
        if (item.text.toLowerCase().includes(q)) {
            matchIds.add(item.id);
            let parentId = item.parentId;
            while (parentId) {
                matchIds.add(parentId);
                parentId = PROCESS_TREE_LIST.find(x => x.id === parentId)?.parentId ?? null;
            }
        }
    });
    return PROCESS_TREE_LIST.filter(item => matchIds.has(item.id));
});

// ── Doble clic → agregar tag ──────────────────────────────────────────────────
function onRowDblClick(e) {
    const item = e.data;
    if (item.type === 'tag' && item.tagData) {
        emit('add-tag', { key: item.id, ...item.tagData });
    }
}
</script>

<template>
    <div class="pdock flex flex-column h-full">




        <!-- ── TAB: Tags ─────────────────────────────────────────────── -->
        <template v-if="activeTab === 'tags'">

        <!-- Búsqueda ────────────────────────────────────────────────────── -->
        <div class="pdock-search">
            <span class="dx-icon-search pdock-search-icon" />
            <input
                v-model="search"
                class="pdock-search-input"
                placeholder="Buscar tag..."
            />
        </div>

        <!-- Hint ────────────────────────────────────────────────────────── -->
        <div class="pdock-hint">
            <i class="pi pi-info-circle" />
            Doble clic para agregar al análisis
        </div>

        <!-- DxTreeList ──────────────────────────────────────────────────── -->
        <div class="pdock-tree flex-1 overflow-auto">
            <DxTreeList
                :data-source="filteredData"
                key-expr="id"
                parent-id-expr="parentId"
                :show-column-headers="false"
                :show-borders="false"
                :show-row-lines="false"
                :show-column-lines="false"
                :row-alternation-enabled="false"
                :auto-expand-all="false"
                :expanded-row-keys="expandedKeys"
                width="100%"
                @row-dbl-click="onRowDblClick"
            >
                <DxColumn data-field="text" cell-template="nodeTpl" />
                <template #nodeTpl="{ data: cell }">
                    <div class="tree-node" :class="cell.data.type">
                        <i :class="[nodeIcon(cell.data).icon, nodeIcon(cell.data).cls, 'tree-icon']" />
                        <span class="tree-label">{{ cell.data.text }}</span>
                        <span v-if="cell.data.type === 'tag' && cell.data.tagData"
                              class="tree-unit">{{ cell.data.tagData.unidad }}</span>
                    </div>
                </template>
            </DxTreeList>
        </div>

        <!-- Leyenda de tipos ────────────────────────────────────────────── -->
        <div class="pdock-legend">
            <div class="legend-row">
                <i class="pi pi-sun node-tag-t" /> Temperatura
                <i class="pi pi-gauge node-tag-p ml-2" /> Presión
            </div>
            <div class="legend-row">
                <i class="pi pi-arrow-right node-tag-f" /> Flujo
                <i class="pi pi-wave-pulse node-tag-l ml-2" /> Nivel
                <i class="pi pi-chart-line node-tag-a ml-2" /> Analítico
            </div>
        </div>

        </template><!-- /TAB Tags -->

        <!-- ── TAB: Operaciones ──────────────────────────────────────── -->
        <template v-else>
            <OperationsTreeDock
                class="flex-1 min-h-0"
                style="overflow:hidden;display:flex;flex-direction:column"
                @add-metric="m => emit('add-metric', m)"
            />
        </template>

    </div>
</template>

<style scoped>
/* ── Dock ──────────────────────────────────────────────────────────────────── */
.pdock { background: var(--p-surface-50); font-family: 'Segoe UI', system-ui, sans-serif; }

/* ── Tabs ──────────────────────────────────────────────────────────────────── */
.pdock-tabs {
    display: flex; border-bottom: 2px solid var(--p-surface-300);
    background: var(--p-surface-100);
}
.pdock-tab {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px;
    padding: 5px 4px; border: none; background: transparent; cursor: pointer;
    font-size: 0.68rem; font-weight: 600; color: var(--p-text-muted-color);
    font-family: inherit; border-bottom: 2px solid transparent; margin-bottom: -2px;
    transition: color 0.15s, border-color 0.15s;
}
.pdock-tab:hover { color: var(--p-text-color); }
.pdock-tab-active { color: var(--p-primary-color); border-bottom-color: var(--p-primary-color); }

.pdock-header {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 10px;
    background: var(--p-surface-100);
    border-bottom: 1px solid var(--p-surface-200);
    font-size: 0.72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--p-text-muted-color);
}

/* ── Búsqueda ──────────────────────────────────────────────────────────────── */
.pdock-search {
    position: relative; padding: 6px 8px;
    border-bottom: 1px solid var(--p-surface-200);
}
.pdock-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: var(--p-text-muted-color); font-size: 0.8rem; pointer-events: none;
}
.pdock-search-input {
    width: 100%; padding: 3px 6px 3px 24px;
    border: 1px solid var(--p-surface-300);
    border-radius: 3px;
    font-size: 0.75rem; background: var(--p-surface-0);
    color: var(--p-text-color); outline: none;
}
.pdock-search-input:focus { border-color: var(--p-primary-color); }

/* ── Hint ──────────────────────────────────────────────────────────────────── */
.pdock-hint {
    font-size: 0.65rem; color: var(--p-text-muted-color);
    padding: 3px 10px; border-bottom: 1px solid var(--p-surface-200);
    display: flex; align-items: center; gap: 4px;
}

/* ── Árbol ─────────────────────────────────────────────────────────────────── */
.pdock-tree { overflow-y: auto; }

/* Override DxTreeList internal styles */
.pdock-tree :deep(.dx-treelist-cell-expandable) { padding: 1px 4px !important; }
.pdock-tree :deep(.dx-row > td) { padding: 0 !important; border: none !important; }
.pdock-tree :deep(.dx-treelist-empty-space) { width: 14px !important; }
.pdock-tree :deep(.dx-treelist-icon-container) { width: 14px !important; }
.pdock-tree :deep(.dx-treelist) { background: transparent; }
.pdock-tree :deep(.dx-treelist-rowsview) { background: transparent; }
.pdock-tree :deep(.dx-row-focused > td),
.pdock-tree :deep(.dx-row-focused > td:first-child) {
    background: var(--p-surface-200) !important;
    color: inherit !important;
}

/* ── Nodo del árbol ────────────────────────────────────────────────────────── */
.tree-node {
    display: flex; align-items: center; gap: 5px;
    padding: 2px 0; cursor: default; font-size: 0.76rem;
}
.tree-node.tag { cursor: pointer; }
.tree-node.tag:hover { color: var(--p-primary-color); }

.tree-icon { font-size: 0.78rem; flex-shrink: 0; }
.tree-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tree-unit {
    font-size: 0.62rem; color: var(--p-text-muted-color);
    background: var(--p-surface-200); border-radius: 3px;
    padding: 0 4px; flex-shrink: 0;
}

/* Colores por tipo de instrumento */
.node-root   { color: var(--p-primary-color); font-weight: 700; }
.node-sitio  { color: var(--p-primary-color); font-weight: 700; }
.node-planta { color: var(--p-primary-color); }
.node-area   { color: var(--p-text-muted-color); }
.node-tag-t  { color: #f59e0b; }   /* temperatura */
.node-tag-p  { color: #3b82f6; }   /* presión */
.node-tag-f  { color: #06b6d4; }   /* flujo */
.node-tag-l  { color: #8b5cf6; }   /* nivel */
.node-tag-a  { color: #10b981; }   /* analítico */

/* ── Leyenda ───────────────────────────────────────────────────────────────── */
.pdock-legend {
    padding: 5px 10px;
    border-top: 1px solid var(--p-surface-200);
    font-size: 0.65rem; color: var(--p-text-muted-color);
    background: var(--p-surface-100);
}
.legend-row { display: flex; align-items: center; gap: 4px; margin-bottom: 1px; }
</style>
