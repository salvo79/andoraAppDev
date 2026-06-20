<script setup>
import { DxTreeList, DxColumn } from 'devextreme-vue/tree-list';
import { ref, computed } from 'vue';
import { useGlobalVarsStore } from '@/stores/GlobalVars';

const emit = defineEmits(['add-tag', 'drag-tags']);

const globalVars = useGlobalVarsStore();

const search = ref('');

const expandedKeys = ref(['__root__']);

// ── Iconos por tipo de nodo ───────────────────────────────────────────────────
const NODE_ICONS = {
    root:     { icon: 'pi pi-database',    cls: 'node-root'     },
    sitio:    { icon: 'pi pi-map-marker',  cls: 'node-sitio'    },
    planta:   { icon: 'pi pi-building',    cls: 'node-planta'   },
    area:     { icon: 'pi pi-sitemap',     cls: 'node-area'     },
    grupo:      { icon: 'pi pi-folder',        cls: 'node-grupo'      },
    subgrupo:   { icon: 'pi pi-folder-open',  cls: 'node-subgrupo'   },
    cliente:    { icon: 'pi pi-building',      cls: 'node-cliente'    },
    producto:   { icon: 'pi pi-box',           cls: 'node-producto'   },
    vendedor:   { icon: 'pi pi-user',          cls: 'node-vendedor'   },
    inventario: { icon: 'pi pi-warehouse',     cls: 'node-inventario' },
    corriente:  { icon: 'pi pi-arrow-right-arrow-left', cls: 'node-corriente' },
    precio:     { icon: 'pi pi-tag',           cls: 'node-precio'     },
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

// ── Solo el nodo raíz (Andora Analytics) ─────────────────────────────────────
const baseData = computed(() => [
    { id: '__root__', parentId: null, text: globalVars.company, type: 'root', tagData: null },
]);

const filteredData = computed(() => baseData.value);

// ── Doble clic → agregar tag ──────────────────────────────────────────────────
function onRowDblClick(e) {
    const item = e.data;
    if (item.type === 'tag' && item.tagData) {
        emit('add-tag', { key: item.id, ...item.tagData });
    }
}

// ── Drag & Drop ───────────────────────────────────────────────────────────────
function onDragStart(e, item) {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'copy';
    if (item.type !== 'tag' || !item.tagData) return;
    const tags = [{ key: item.id, ...item.tagData }];
    const payload = JSON.stringify({ nodeType: 'tags', items: tags });
    e.dataTransfer.setData('application/andora-node', payload);
    e.dataTransfer.setData('text/plain', payload);
    emit('drag-tags', tags);
}
</script>

<template>
    <div class="pdock">

        <!-- Búsqueda ────────────────────────────────────────────────────── -->
        <div class="pdock-search">
            <span class="dx-icon-search pdock-search-icon" />
            <input
                v-model="search"
                class="pdock-search-input"
                placeholder="Buscar tag..."
            />
        </div>

        <!-- DxTreeList ──────────────────────────────────────────────────── -->
        <div class="pdock-tree">
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

                    <!-- ROOT: badge de compañía ──────────────────────────── -->
                    <div v-if="cell.data.type === 'root'" class="tree-node tree-root">
                        <span class="root-avatar"><i class="pi pi-database" /></span>
                        <span class="root-label">{{ cell.data.text }}</span>
                    </div>

                    <!-- GRUPO / SUBGRUPO: separador de sección ──────────── -->
                    <div v-else-if="cell.data.type === 'grupo' || cell.data.type === 'subgrupo'"
                         class="tree-node tree-grupo"
                         :class="'tree-grupo--' + cell.data.id.replace(/^grp(-inv)?-/,'')">
                        <i :class="[nodeIcon(cell.data).icon, 'grupo-icon']" />
                        <span class="grupo-label">{{ cell.data.text }}</span>
                        <span class="grupo-line" />
                    </div>

                    <!-- TAG: icono coloreado + tipo badge + unidad ────────── -->
                    <div v-else-if="cell.data.type === 'tag'"
                         class="tree-node tree-tag"
                         draggable="true"
                         @dragstart="onDragStart($event, cell.data)">
                        <span class="tag-dot" :class="nodeIcon(cell.data).cls" />
                        <span class="tree-label">{{ cell.data.text }}</span>
                        <span class="tag-tipo" :class="nodeIcon(cell.data).cls">
                            {{ cell.data.tagData?.tipo }}
                        </span>
                        <span class="tag-unit">{{ cell.data.tagData?.unidad }}</span>
                        <i class="pi pi-arrows-alt drag-handle" title="Arrastrar al análisis" />
                    </div>

                    <!-- RESTO: sitio / planta / area / cliente / producto / vendedor -->
                    <div v-else class="tree-node tree-leaf" :class="'tree-leaf--' + cell.data.type"
                         draggable="true"
                         @dragstart="onDragStart($event, cell.data)">
                        <span class="leaf-icon-wrap" :class="nodeIcon(cell.data).cls + '-bg'">
                            <i :class="[nodeIcon(cell.data).icon, nodeIcon(cell.data).cls]" />
                        </span>
                        <span class="tree-label">{{ cell.data.text }}</span>
                        <i class="pi pi-arrows-alt drag-handle" title="Arrastrar al análisis" />
                    </div>

                </template>
            </DxTreeList>
        </div>

        

    </div>
</template>

<style scoped>
/* ── Dock ──────────────────────────────────────────────────────────────────── */
.pdock {
    display: flex; flex-direction: column;
    height: 100%; width: 100%;
    background: var(--p-surface-50);
    font-family: 'Segoe UI', system-ui, sans-serif;
    overflow: hidden;
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
.pdock-tree { flex: 1; min-height: 0; overflow-y: auto; }

/* DxTreeList overrides */
.pdock-tree :deep(.dx-treelist)            { background: transparent; }
.pdock-tree :deep(.dx-treelist-rowsview)   { background: transparent; }
.pdock-tree :deep(.dx-treelist-cell-expandable) { padding: 2px 4px !important; }
.pdock-tree :deep(.dx-row > td)            { padding: 0 !important; border: none !important; }
.pdock-tree :deep(.dx-treelist-empty-space){ width: 12px !important; }
.pdock-tree :deep(.dx-treelist-icon-container){ width: 14px !important; }
.pdock-tree :deep(.dx-data-row:hover > td) { background: var(--p-surface-100) !important; }
.pdock-tree :deep(.dx-row-focused > td),
.pdock-tree :deep(.dx-row-focused > td:first-child) {
    background: var(--p-primary-50, #eff6ff) !important;
    color: inherit !important;
}

/* ── Base del nodo ─────────────────────────────────────────────────────────── */
.tree-node {
    display: flex; align-items: center;
    padding: 1px 2px; cursor: default;
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.76rem;
}
.tree-label {
    flex: 1; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
}

/* ── ROOT ──────────────────────────────────────────────────────────────────── */
.tree-root { gap: 7px; padding: 3px 2px; }
.root-avatar {
    display: flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
    background: var(--p-primary-color);
    color: #fff; font-size: 0.72rem;
}
.root-label {
    font-weight: 700; font-size: 0.78rem;
    color: var(--p-primary-color);
    letter-spacing: 0.01em;
}

/* ── GRUPO ─────────────────────────────────────────────────────────────────── */
.tree-grupo { gap: 5px; padding: 4px 2px 3px; }
.grupo-icon { font-size: 0.68rem; flex-shrink: 0; }
.grupo-label {
    font-size: 0.66rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
}
.grupo-line { flex: 1; height: 1px; background: currentColor; opacity: 0.2; margin-left: 3px; }

.tree-grupo--sitios       { color: var(--p-primary-color); }
.tree-grupo--clientes     { color: #0ea5e9; }
.tree-grupo--productos    { color: #10b981; }
.tree-grupo--vendedores   { color: #f59e0b; }
.tree-grupo--inventarios      { color: #e879f9; }
.tree-grupo--pt               { color: #a855f7; }
.tree-grupo--corr             { color: #c084fc; }
.tree-grupo--precios          { color: #f43f5e; }
.tree-grupo--producto-final   { color: #fb7185; }
.tree-grupo--materia-prima    { color: #fda4af; }
.tree-grupo--corriente-interna{ color: #fecdd3; }
.tree-grupo--servicio         { color: #ffe4e6; }

/* ── LEAF (sitio / planta / area / cliente / producto / vendedor) ──────────── */
.tree-leaf { gap: 6px; padding: 2px 2px; }
.leaf-icon-wrap {
    display: flex; align-items: center; justify-content: center;
    width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
    font-size: 0.72rem;
}

/* Icon-wrap backgrounds (tipo + color) */
.node-sitio-bg   { background: rgba(59,130,246,0.12);  }
.node-planta-bg  { background: rgba(59,130,246,0.08);  }
.node-area-bg    { background: rgba(100,116,139,0.10); }
.node-cliente-bg { background: rgba(14,165,233,0.12);  }
.node-producto-bg{ background: rgba(16,185,129,0.12);  }
.node-vendedor-bg{ background: rgba(245,158,11,0.12);  }

/* Text colors */
.node-sitio   { color: var(--p-primary-color); font-weight: 600; font-size: 0.77rem; }
.node-planta  { color: var(--p-primary-color); font-size: 0.75rem; }
.node-area    { color: var(--p-text-muted-color); font-size: 0.73rem; }
.node-cliente    { color: #0ea5e9; }
.node-producto   { color: #10b981; }
.node-vendedor   { color: #f59e0b; }
.node-subgrupo   { color: #a855f7; font-style: italic; }
.node-inventario { color: #e879f9; }
.node-corriente  { color: #c084fc; }
.node-precio     { color: #f43f5e; }

.node-subgrupo-bg   { background: rgba(168,85,247,0.10); }
.node-inventario-bg { background: rgba(232,121,249,0.12); }
.node-corriente-bg  { background: rgba(192,132,252,0.12); }
.node-precio-bg     { background: rgba(244,63,94,0.10);   }

/* Hover para hojas clicables */
.tree-leaf:hover .tree-label { color: var(--p-primary-color); }
.tree-leaf--sitio:hover .tree-label,
.tree-leaf--planta:hover .tree-label { color: var(--p-primary-color); }

/* ── Drag handle ───────────────────────────────────────────────────────────── */
.drag-handle {
    font-size: 0.6rem; opacity: 0; flex-shrink: 0;
    color: var(--p-text-muted-color);
    cursor: grab; transition: opacity 0.15s;
    margin-left: auto;
}
.tree-tag:hover .drag-handle,
.tree-leaf:hover .drag-handle { opacity: 0.5; }
.tree-tag:active .drag-handle,
.tree-leaf:active .drag-handle { cursor: grabbing; opacity: 1; }

[draggable="true"] { cursor: grab; }
[draggable="true"]:active { cursor: grabbing; }

/* ── TAG ───────────────────────────────────────────────────────────────────── */
.tree-tag { gap: 5px; padding: 2px 2px; cursor: grab; }
.tree-tag:hover .tree-label { color: var(--p-primary-color); }

.tag-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.tag-tipo {
    font-size: 0.58rem; font-weight: 700; letter-spacing: 0.04em;
    padding: 0 4px; border-radius: 3px; line-height: 1.5;
    border: 1px solid currentColor; flex-shrink: 0;
    background: transparent;
}
.tag-unit {
    font-size: 0.6rem; color: var(--p-text-muted-color);
    background: var(--p-surface-200); border-radius: 3px;
    padding: 0 4px; flex-shrink: 0;
}

/* Tag tipo colors (dot + badge bg) */
.node-tag-t { color: #f59e0b; }
.node-tag-p { color: #3b82f6; }
.node-tag-f { color: #06b6d4; }
.node-tag-l { color: #8b5cf6; }
.node-tag-a { color: #10b981; }
</style>
