<script setup>
import { ref } from 'vue';
import PlantPalette from '@/components/planta/PlantPalette.vue';
import PlantCanvas  from '@/components/planta/PlantCanvas.vue';

const canvasRef = ref(null);
const selectedCount = ref(0);
const diagramName = ref('Nueva Planta');
const editingName = ref(false);
const saveStatus = ref('idle'); // idle | saved | error

function onSelectionChange(cells) {
    selectedCount.value = cells.length;
}

function saveXml() {
    const xml = canvasRef.value?.exportXml();
    if (!xml) return;
    try {
        localStorage.setItem('planta_xml_' + diagramName.value, xml);
        saveStatus.value = 'saved';
        setTimeout(() => { saveStatus.value = 'idle'; }, 2000);
    } catch {
        saveStatus.value = 'error';
    }
}

function loadXml() {
    const xml = localStorage.getItem('planta_xml_' + diagramName.value);
    if (xml) canvasRef.value?.importXml(xml);
}

function exportSvg() {
    const svgEl = document.querySelector('.plant-canvas svg');
    if (!svgEl) return;
    const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = diagramName.value + '.svg';
    a.click();
}

function confirmClear() {
    if (confirm('¿Limpiar todo el diagrama?')) canvasRef.value?.clearAll();
}
</script>

<template>
    <div class="planta-view">

        <!-- ── Toolbar ──────────────────────────────────────────────────── -->
        <div class="pv-toolbar">
            <div class="pv-toolbar-left">
                <i class="pi pi-sitemap pv-logo-icon" />
                <span
                    v-if="!editingName"
                    class="pv-diagram-name"
                    @dblclick="editingName = true"
                    title="Doble clic para renombrar"
                >{{ diagramName }}</span>
                <input
                    v-else
                    v-model="diagramName"
                    class="pv-name-input"
                    @blur="editingName = false"
                    @keyup.enter="editingName = false"
                    autofocus
                />
            </div>

            <div class="pv-toolbar-center">
                <button class="pv-btn" title="Deshacer (Ctrl+Z)" @click="canvasRef?.undo()">
                    <i class="pi pi-undo" />
                </button>
                <button class="pv-btn" title="Rehacer (Ctrl+Y)" @click="canvasRef?.redo()">
                    <i class="pi pi-refresh" />
                </button>
                <div class="pv-sep" />
                <button class="pv-btn" title="Eliminar selección (Del)" @click="canvasRef?.deleteSelected()" :disabled="!selectedCount">
                    <i class="pi pi-trash" />
                </button>
                <div class="pv-sep" />
                <button class="pv-btn" title="Zoom +" @click="canvasRef?.zoomIn()">
                    <i class="pi pi-search-plus" />
                </button>
                <button class="pv-btn" title="Zoom -" @click="canvasRef?.zoomOut()">
                    <i class="pi pi-search-minus" />
                </button>
                <button class="pv-btn" title="Ajustar pantalla" @click="canvasRef?.fit()">
                    <i class="pi pi-expand" />
                </button>
                <div class="pv-sep" />
                <button class="pv-btn pv-btn--danger" title="Limpiar todo" @click="confirmClear">
                    <i class="pi pi-times-circle" />
                </button>
            </div>

            <div class="pv-toolbar-right">
                <span v-if="selectedCount" class="pv-selection-badge">{{ selectedCount }} sel.</span>
                <button class="pv-btn" title="Cargar diagrama" @click="loadXml">
                    <i class="pi pi-folder-open" />
                </button>
                <button class="pv-btn" title="Guardar diagrama" @click="saveXml">
                    <i class="pi pi-save" />
                    <span v-if="saveStatus === 'saved'" class="pv-save-ok">✓</span>
                </button>
                <button class="pv-btn" title="Exportar SVG" @click="exportSvg">
                    <i class="pi pi-download" />
                </button>
            </div>
        </div>

        <!-- ── Body ────────────────────────────────────────────────────── -->
        <div class="pv-body">
            <div class="pv-palette-wrap">
                <PlantPalette />
            </div>
            <div class="pv-canvas-wrap">
                <PlantCanvas
                    ref="canvasRef"
                    @selection-change="onSelectionChange"
                />
            </div>
        </div>

    </div>
</template>

<style scoped>
.planta-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Toolbar ── */
.pv-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    height: 40px;
    flex-shrink: 0;
    background: var(--p-surface-0);
    border-bottom: 1px solid var(--p-surface-200);
    gap: 8px;
}
.pv-toolbar-left, .pv-toolbar-center, .pv-toolbar-right {
    display: flex;
    align-items: center;
    gap: 4px;
}
.pv-logo-icon {
    font-size: 1rem;
    color: var(--p-primary-color);
    margin-right: 4px;
}
.pv-diagram-name {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--p-text-color);
    cursor: text;
    padding: 2px 4px;
    border-radius: 3px;
}
.pv-diagram-name:hover { background: var(--p-surface-100); }
.pv-name-input {
    font-size: 0.82rem;
    font-weight: 600;
    border: 1px solid var(--p-primary-color);
    border-radius: 3px;
    padding: 1px 6px;
    outline: none;
    background: var(--p-surface-0);
    color: var(--p-text-color);
    width: 160px;
}
.pv-sep {
    width: 1px;
    height: 20px;
    background: var(--p-surface-300);
    margin: 0 2px;
}
.pv-btn {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 4px 7px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--p-text-color);
    font-size: 0.78rem;
    cursor: pointer;
    transition: background 0.15s;
}
.pv-btn:hover:not(:disabled) { background: var(--p-surface-100); }
.pv-btn:disabled { opacity: 0.35; cursor: default; }
.pv-btn--danger:hover:not(:disabled) { background: #fee2e2; color: #ef4444; }
.pv-save-ok { font-size: 0.7rem; color: #10b981; font-weight: 700; }
.pv-selection-badge {
    font-size: 0.68rem;
    background: var(--p-primary-color);
    color: #fff;
    padding: 1px 6px;
    border-radius: 10px;
}

/* ── Body ── */
.pv-body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}
.pv-palette-wrap {
    width: 160px;
    flex-shrink: 0;
    overflow: hidden;
}
.pv-canvas-wrap {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    position: relative;
}
</style>
