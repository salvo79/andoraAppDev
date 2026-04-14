<script setup>
import { PROCESS_TREE_DX } from '@/service/seguimientoService';
import { DxTreeView } from 'devextreme-vue/tree-view';
import { ref } from 'vue';

const emit = defineEmits(['add-tag']);

const treeRef = ref(null);
const search  = ref('');

// ── Iconos por tipo de nodo ───────────────────────────────────────────────────
const NODE_ICONS = {
    sitio:  { icon: 'pi pi-map-marker',            cls: 'node-sitio'  },
    planta: { icon: 'pi pi-building',              cls: 'node-planta' },
    area:   { icon: 'pi pi-sitemap',               cls: 'node-area'   },
    tag:    {
        T: { icon: 'pi pi-sun',                   cls: 'node-tag-t'  },
        P: { icon: 'pi pi-gauge',                 cls: 'node-tag-p'  },
        F: { icon: 'pi pi-arrow-right',           cls: 'node-tag-f'  },
        L: { icon: 'pi pi-wave-pulse',            cls: 'node-tag-l'  },
        A: { icon: 'pi pi-chart-line',            cls: 'node-tag-a'  },
    },
};

function nodeIcon(item) {
    if (item.type !== 'tag') return NODE_ICONS[item.type] || NODE_ICONS.area;
    return NODE_ICONS.tag[item.tagData?.tipo] || NODE_ICONS.tag.A;
}

// ── Doble clic → agregar tag ──────────────────────────────────────────────────
function onItemDblClick(e) {
    const item = e.itemData;
    if (item.type === 'tag' && item.tagData) {
        emit('add-tag', { key: item.id, ...item.tagData });
    }
}

// ── Búsqueda en árbol ─────────────────────────────────────────────────────────
function onSearch() {
    treeRef.value?.instance.option('searchValue', search.value);
}
</script>

<template>
    <div class="pdock flex flex-column h-full">

        <!-- Cabecera dock ───────────────────────────────────────────────── -->
        <div class="pdock-header">
            <i class="pi pi-sitemap" />
            <span>Árbol de Proceso</span>
        </div>

        <!-- Búsqueda ────────────────────────────────────────────────────── -->
        <div class="pdock-search">
            <span class="dx-icon-search pdock-search-icon" />
            <input
                v-model="search"
                class="pdock-search-input"
                placeholder="Buscar tag..."
                @input="onSearch"
            />
        </div>

        <!-- Hint ────────────────────────────────────────────────────────── -->
        <div class="pdock-hint">
            <i class="pi pi-info-circle" />
            Doble clic para agregar al análisis
        </div>

        <!-- DxTreeView ──────────────────────────────────────────────────── -->
        <div class="pdock-tree flex-1 overflow-auto">
            <DxTreeView
                ref="treeRef"
                :items="PROCESS_TREE_DX"
                :search-enabled="false"
                :expand-all-enabled="false"
                selection-mode="single"
                item-alt-text="label"
                width="100%"
                @item-dbl-click="onItemDblClick"
            >
                <template #item="{ data: item }">
                    <div class="tree-node" :class="item.type">
                        <i :class="[nodeIcon(item).icon, nodeIcon(item).cls, 'tree-icon']" />
                        <span class="tree-label">{{ item.text }}</span>
                        <span v-if="item.type === 'tag' && item.tagData"
                              class="tree-unit">{{ item.tagData.unidad }}</span>
                    </div>
                </template>
            </DxTreeView>
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
    </div>
</template>

<style scoped>
/* ── Dock ──────────────────────────────────────────────────────────────────── */
.pdock { background: var(--p-surface-50); font-family: 'Segoe UI', system-ui, sans-serif; }

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

/* Override DxTreeView internal styles */
.pdock-tree :deep(.dx-treeview-item) { padding: 1px 4px !important; }
.pdock-tree :deep(.dx-treeview-item-content) { padding: 0 !important; }
.pdock-tree :deep(.dx-treeview-node) { padding-left: 12px !important; }

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
