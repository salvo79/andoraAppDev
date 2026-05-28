<script setup>
import { ref, onMounted } from 'vue';
import { DxTreeView } from 'devextreme-vue/tree-view';
import api from '@/service/api';
import { useGlobalVarsStore } from '@/stores/GlobalVars';

const gv = useGlobalVarsStore();

const treeData  = ref([]);
const loading   = ref(true);
const error     = ref(false);
const search    = ref('');
const treeRef   = ref(null);

// ── Icon map per node type ────────────────────────────────────────────────────
const NODE_ICONS = {
    company:        { icon: 'pi pi-building',      cls: 'node-company'  },
    sitio:          { icon: 'pi pi-map-marker',     cls: 'node-sitio'   },
    planta:         { icon: 'pi pi-cog',            cls: 'node-planta'  },
    tanque:         { icon: 'pi pi-database',       cls: 'node-tanque'  },
    corriente:      { icon: 'pi pi-arrows-h',       cls: 'node-corriente' },
    'corriente-tipo': { icon: 'pi pi-tag',          cls: 'node-ctype'   },
    seccion:        { icon: 'pi pi-th-large',       cls: 'node-seccion' },
};

function nodeIcon(item) {
    return NODE_ICONS[item.type] || { icon: 'pi pi-circle', cls: '' };
}

// ── Load tree from backend, wrap with company root ────────────────────────────
async function loadTree() {
    loading.value = true;
    error.value   = false;
    try {
        const { data } = await api.get('/catalog/tree');
        treeData.value = [{
            id:       'company-root',
            text:     gv.company,
            type:     'company',
            expanded: true,
            items:    data,
        }];
    } catch {
        error.value = true;
    } finally {
        loading.value = false;
    }
}

onMounted(loadTree);

function onSearch() {
    treeRef.value?.instance.option('searchValue', search.value);
}
</script>

<template>
    <div class="ctdock flex flex-column h-full">

        <!-- Search ──────────────────────────────────────────────────────────── -->
        <div class="ctd-search">
            <span class="dx-icon-search ctd-search-icon" />
            <input
                v-model="search"
                class="ctd-search-input"
                placeholder="Buscar activo..."
                @input="onSearch"
            />
        </div>

        <!-- Loading ─────────────────────────────────────────────────────────── -->
        <div v-if="loading" class="ctd-state">
            <i class="pi pi-spin pi-spinner" />
            Cargando activos...
        </div>

        <!-- Error ───────────────────────────────────────────────────────────── -->
        <div v-else-if="error" class="ctd-state ctd-error">
            <i class="pi pi-times-circle" />
            Error al cargar
            <button class="ctd-retry" @click="loadTree">Reintentar</button>
        </div>

        <!-- Tree ────────────────────────────────────────────────────────────── -->
        <div v-else class="ctd-tree flex-1 overflow-auto">
            <DxTreeView
                ref="treeRef"
                :items="treeData"
                key-expr="id"
                display-expr="text"
                items-expr="items"
                :search-enabled="false"
                :expand-all-enabled="false"
                selection-mode="single"
                width="100%"
            >
                <template #item="{ data: item }">
                    <div class="ct-node" :class="item.type">
                        <i :class="[nodeIcon(item).icon, nodeIcon(item).cls, 'ct-icon']" />
                        <span class="ct-label">{{ item.text }}</span>
                        <span v-if="item.tipoProducto" class="ct-badge">{{ item.tipoProducto }}</span>
                        <span v-else-if="item.unidad" class="ct-badge">{{ item.unidad }}</span>
                    </div>
                </template>
            </DxTreeView>
        </div>

        <!-- Legend ──────────────────────────────────────────────────────────── -->
        <div class="ctd-legend">
            <div class="legend-row">
                <i class="pi pi-map-marker node-sitio" /> Sitio
                <i class="pi pi-cog node-planta ml-2" /> Planta
            </div>
            <div class="legend-row">
                <i class="pi pi-database node-tanque" /> Tanque
                <i class="pi pi-arrows-h node-corriente ml-2" /> Corriente
            </div>
        </div>

    </div>
</template>

<style scoped>
.ctdock { background: var(--p-surface-50); font-family: 'Segoe UI', system-ui, sans-serif; }

/* Search */
.ctd-search {
    position: relative; padding: 6px 8px;
    border-bottom: 1px solid var(--p-surface-200);
}
.ctd-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: var(--p-text-muted-color); font-size: 0.8rem; pointer-events: none;
}
.ctd-search-input {
    width: 100%; padding: 3px 6px 3px 24px;
    border: 1px solid var(--p-surface-300);
    border-radius: 3px;
    font-size: 0.75rem; background: var(--p-surface-0);
    color: var(--p-text-color); outline: none;
    box-sizing: border-box;
}
.ctd-search-input:focus { border-color: var(--p-primary-color); }

/* State */
.ctd-state {
    display: flex; align-items: center; gap: 6px;
    padding: 12px 10px; font-size: 0.75rem; color: var(--p-text-muted-color);
}
.ctd-error { color: #ef4444; }
.ctd-retry {
    margin-left: 6px; font-size: 0.7rem; padding: 1px 6px;
    border: 1px solid #ef4444; border-radius: 3px; background: transparent;
    color: #ef4444; cursor: pointer;
}
.ctd-retry:hover { background: #fef2f2; }

/* Tree */
.ctd-tree { overflow-y: auto; }
.ctd-tree :deep(.dx-treeview-item) { padding: 1px 4px !important; }
.ctd-tree :deep(.dx-treeview-item-content) { padding: 0 !important; }
.ctd-tree :deep(.dx-treeview-node) { padding-left: 12px !important; }

/* Node */
.ct-node {
    display: flex; align-items: center; gap: 5px;
    padding: 2px 0; font-size: 0.76rem; cursor: default;
}
.ct-icon { font-size: 0.78rem; flex-shrink: 0; }
.ct-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ct-badge {
    font-size: 0.6rem; color: var(--p-text-muted-color);
    background: var(--p-surface-200); border-radius: 3px;
    padding: 0 4px; flex-shrink: 0;
}

/* Node type colors */
.node-company  { color: var(--p-primary-color); font-weight: 800; }
.node-sitio    { color: #6366f1; }
.node-planta   { color: #0ea5e9; }
.node-tanque   { color: #10b981; }
.node-corriente { color: #f59e0b; }
.node-ctype    { color: var(--p-text-muted-color); }
.node-seccion  { color: var(--p-text-muted-color); font-weight: 700; }

/* Bold for structural nodes */
.ct-node.company .ct-label  { font-weight: 800; }
.ct-node.sitio .ct-label    { font-weight: 700; }
.ct-node.seccion .ct-label  { font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; }

/* Legend */
.ctd-legend {
    padding: 5px 10px;
    border-top: 1px solid var(--p-surface-200);
    font-size: 0.65rem; color: var(--p-text-muted-color);
    background: var(--p-surface-100);
}
.legend-row { display: flex; align-items: center; gap: 4px; margin-bottom: 1px; }
</style>
