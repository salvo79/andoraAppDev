<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import {
    Graph,
    InternalEvent,
    RubberBandHandler,
    KeyHandler,
    UndoManager,
    getDefaultPlugins,
} from '@maxgraph/core';

const emit = defineEmits(['selection-change']);
const containerRef = ref(null);

let graph = null;
let undoManager = null;
let keyHandler = null;

// ── Style strings (P&ID palette ids → mxGraph-style strings) ─────────────────
const SHAPE_STYLES = {
    'tank-v':       'shape=mxgraph.pid.tanks.tank;fillColor=#dbeafe;strokeColor=#3b82f6;',
    'tank-h':       'shape=mxgraph.pid.tanks.horizontal_tank;fillColor=#dbeafe;strokeColor=#3b82f6;',
    'reactor':      'shape=mxgraph.pid.vessels.reactor;fillColor=#d1fae5;strokeColor=#10b981;',
    'column':       'shape=mxgraph.pid.vessels.distillation_column;fillColor=#ede9fe;strokeColor=#8b5cf6;',
    'hx':           'shape=mxgraph.pid.heat_exchangers.heat_exchanger;fillColor=#fef3c7;strokeColor=#f59e0b;',
    'furnace':      'shape=mxgraph.pid.heat_exchangers.furnace;fillColor=#fee2e2;strokeColor=#ef4444;',
    'pump-c':       'shape=mxgraph.pid.pumps.centrifugal_pump;fillColor=#dbeafe;strokeColor=#3b82f6;',
    'pump-p':       'shape=mxgraph.pid.pumps.positive_displacement_pump;fillColor=#dbeafe;strokeColor=#3b82f6;',
    'compressor':   'shape=mxgraph.pid.compressors_turbines.centrifugal_compressor;fillColor=#d1fae5;strokeColor=#10b981;',
    'fan':          'shape=mxgraph.pid.fans_blowers.fan;fillColor=#fef9c3;strokeColor=#eab308;',
    'turbine':      'shape=mxgraph.pid.compressors_turbines.axial_turbine;fillColor=#fdf4ff;strokeColor=#a855f7;',
    'valve-gate':   'shape=mxgraph.pid.valves.gate_valve;fillColor=#dbeafe;strokeColor=#3b82f6;',
    'valve-globe':  'shape=mxgraph.pid.valves.globe_valve;fillColor=#d1fae5;strokeColor=#10b981;',
    'valve-ball':   'shape=mxgraph.pid.valves.ball_valve;fillColor=#fef3c7;strokeColor=#f59e0b;',
    'valve-check':  'shape=mxgraph.pid.valves.check_valve;fillColor=#fee2e2;strokeColor=#ef4444;',
    'valve-control':'shape=mxgraph.pid.valves.control_valve;fillColor=#ede9fe;strokeColor=#8b5cf6;',
    'valve-safety': 'shape=mxgraph.pid.valves.safety_relief_valve;fillColor=#fee2e2;strokeColor=#ef4444;',
    'inst-circle':  'ellipse;fillColor=#ffffff;strokeColor=#334155;fontSize=9;',
    'inst-local':   'ellipse;fillColor=#ffffff;strokeColor=#334155;fontSize=9;',
    'inst-dcs':     'ellipse;fillColor=#dbeafe;strokeColor=#3b82f6;fontSize=9;',
    'sensor-t':     'ellipse;fillColor=#fef3c7;strokeColor=#f59e0b;fontStyle=1;fontSize=11;',
    'sensor-p':     'ellipse;fillColor=#dbeafe;strokeColor=#3b82f6;fontStyle=1;fontSize=11;',
    'sensor-f':     'ellipse;fillColor=#d1fae5;strokeColor=#10b981;fontStyle=1;fontSize=11;',
    'sensor-l':     'ellipse;fillColor=#ede9fe;strokeColor=#8b5cf6;fontStyle=1;fontSize=11;',
    'line-process': 'edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;strokeColor=#334155;strokeWidth=3;',
    'line-utility': 'edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;strokeColor=#64748b;strokeWidth=2;',
    'line-signal':  'edgeStyle=orthogonalEdgeStyle;endArrow=open;dashed=1;strokeColor=#3b82f6;strokeWidth=1;',
    'line-elec':    'edgeStyle=orthogonalEdgeStyle;endArrow=open;dashed=1;strokeColor=#f59e0b;strokeWidth=1;',
};

const SHAPE_LABELS = {
    'tank-v': 'Tanque', 'tank-h': 'Tanque H', 'reactor': 'Reactor',
    'column': 'Columna', 'hx': 'HX', 'furnace': 'Horno',
    'pump-c': 'P', 'pump-p': 'P', 'compressor': 'C', 'fan': 'V', 'turbine': 'T',
    'valve-gate': '', 'valve-globe': '', 'valve-ball': '',
    'valve-check': '', 'valve-control': '', 'valve-safety': '',
    'inst-circle': 'FIC', 'inst-local': 'TI', 'inst-dcs': 'DCS',
    'sensor-t': 'T', 'sensor-p': 'P', 'sensor-f': 'F', 'sensor-l': 'L',
};

const LINE_IDS = new Set(['line-process', 'line-utility', 'line-signal', 'line-elec']);

const DEFAULT_SIZE = {
    'tank-v': [60, 80], 'tank-h': [80, 50], 'reactor': [60, 80],
    'column': [50, 100], 'hx': [80, 50], 'furnace': [70, 60],
    'pump-c': [50, 50], 'pump-p': [50, 50], 'compressor': [55, 55],
    'fan': [55, 55], 'turbine': [55, 55],
    'valve-gate': [40, 30], 'valve-globe': [40, 30], 'valve-ball': [30, 30],
    'valve-check': [40, 30], 'valve-control': [40, 40], 'valve-safety': [40, 40],
    'inst-circle': [36, 36], 'inst-local': [36, 36], 'inst-dcs': [36, 36],
    'sensor-t': [36, 36], 'sensor-p': [36, 36], 'sensor-f': [36, 36], 'sensor-l': [36, 36],
};

// ── Public API ────────────────────────────────────────────────────────────────
function undo()  { undoManager?.undo(); }
function redo()  { undoManager?.redo(); }

function deleteSelected() {
    if (!graph) return;
    const model = graph.getDataModel();
    model.beginUpdate();
    try {
        graph.removeCells(graph.getSelectionCells());
    } finally {
        model.endUpdate();
    }
}

function exportXml() {
    if (!graph) return '';
    const { Codec, xmlUtils } = window.__maxgraph_codec ?? {};
    if (!Codec) return '';
    const codec = new Codec();
    const node = codec.encode(graph.getDataModel());
    return xmlUtils.getPrettyXml(node);
}

function importXml(xml) {
    if (!graph || !xml) return;
    const { Codec, xmlUtils } = window.__maxgraph_codec ?? {};
    if (!Codec) return;
    const doc = xmlUtils.parseXml(xml);
    const codec = new Codec(doc);
    codec.decode(doc.documentElement, graph.getDataModel());
}

function zoomIn()  { graph?.zoomIn(); }
function zoomOut() { graph?.zoomOut(); }
function fit()     { graph?.fit(); }

function clearAll() {
    if (!graph) return;
    graph.selectAll(null, true);
    const model = graph.getDataModel();
    model.beginUpdate();
    try {
        graph.removeCells(graph.getSelectionCells());
    } finally {
        model.endUpdate();
    }
}

defineExpose({ undo, redo, deleteSelected, exportXml, importXml, zoomIn, zoomOut, fit, clearAll });

// ── Drop handler ──────────────────────────────────────────────────────────────
function handleDrop(e) {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/planta-shape');
    if (!raw || !graph) return;
    const item = JSON.parse(raw);

    const pt = graph.getPointForEvent(e);
    const style = SHAPE_STYLES[item.id] ?? '';
    const label = SHAPE_LABELS[item.id] ?? item.label;
    const [w, h] = DEFAULT_SIZE[item.id] ?? [60, 60];
    const parent = graph.getDefaultParent();
    const model = graph.getDataModel();

    model.beginUpdate();
    try {
        if (LINE_IDS.has(item.id)) {
            const src = graph.insertVertex({ parent, value: '', x: pt.x - 30, y: pt.y, width: 0, height: 0, style: 'point;' });
            const tgt = graph.insertVertex({ parent, value: '', x: pt.x + 30, y: pt.y, width: 0, height: 0, style: 'point;' });
            graph.insertEdge({ parent, value: '', source: src, target: tgt, style });
        } else {
            graph.insertVertex({
                parent,
                value: label,
                x: pt.x - w / 2,
                y: pt.y - h / 2,
                width: w,
                height: h,
                style: style + 'verticalLabelPosition=bottom;verticalAlign=top;fontSize=9;',
            });
        }
    } finally {
        model.endUpdate();
    }
}

// ── Graph init ────────────────────────────────────────────────────────────────
onMounted(async () => {
    const container = containerRef.value;

    // Lazy-load Codec/xmlUtils (heavy, only needed for save/load)
    import('@maxgraph/core').then(({ Codec, xmlUtils }) => {
        window.__maxgraph_codec = { Codec, xmlUtils };
    });

    InternalEvent.disableContextMenu(container);

    graph = new Graph(container, undefined, [
        ...getDefaultPlugins(),
        RubberBandHandler,
    ]);

    graph.setConnectable(true);
    graph.setMultigraph(false);
    graph.setAllowDanglingEdges(false);
    graph.setGridEnabled(true);
    graph.setGridSize(10);
    graph.setPanning(true);
    graph.panningHandler.useLeftButtonForPanning = false;

    // Undo/redo wiring
    undoManager = new UndoManager();
    const undoListener = (_sender, evt) => {
        undoManager.undoableEditHappened(evt.getProperty('edit'));
    };
    graph.getDataModel().addListener(InternalEvent.UNDO, undoListener);
    graph.getView().addListener(InternalEvent.UNDO, undoListener);

    // Keyboard shortcuts
    keyHandler = new KeyHandler(graph);
    keyHandler.bindKey(46, () => deleteSelected()); // Delete
    keyHandler.bindKey(8,  () => deleteSelected()); // Backspace

    // Selection change notification
    graph.getSelectionModel().addListener('change', () => {
        emit('selection-change', graph.getSelectionCells());
    });

    // Dot-grid background via CSS
    container.style.backgroundImage =
        'radial-gradient(circle, #cbd5e1 1px, transparent 1px)';
    container.style.backgroundSize = '20px 20px';
    container.style.backgroundPosition = '0 0';
});

onUnmounted(() => {
    keyHandler?.destroy();
    graph?.destroy();
    delete window.__maxgraph_codec;
});
</script>

<template>
    <div
        ref="containerRef"
        class="plant-canvas"
        @dragover.prevent
        @drop="handleDrop"
    />
</template>

<style scoped>
.plant-canvas {
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: default;
    background: var(--p-surface-0);
}
/* maxGraph injects its own SVG/div — ensure it fills the container */
.plant-canvas :deep(> div),
.plant-canvas :deep(> svg) {
    width: 100% !important;
    height: 100% !important;
}
</style>
