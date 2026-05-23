<script setup>
import { evalFormula, TAG_COLORS, fetchTagHistory } from '@/service/seguimientoService';
import { computed, ref } from 'vue';

// ── Props & emits ─────────────────────────────────────────────────────────────
const props = defineProps({
    tags:  { type: Array, default: () => [] }, // tags activos en la pestaña actual
    range: { type: String, default: '8h'   },
});
const emit = defineEmits(['add-calc-var', 'remove-calc-var']);

// ── Estado del editor de fórmulas ─────────────────────────────────────────────
const varName    = ref('');
const varUnidad  = ref('');
const formula    = ref('');
const previewVal = ref(null);
const previewErr = ref('');
const calcVars   = ref([]);  // lista de variables calculadas ya creadas

// ── Valores actuales de los tags (para preview de fórmula) ───────────────────
const lastValues = computed(() => {
    const vals = {};
    props.tags.forEach(tag => {
        const hist = fetchTagHistory(tag, props.range);
        vals[tag.key] = hist.lastValue;
    });
    return vals;
});

// ── Insertar nombre de tag en la fórmula ─────────────────────────────────────
function insertTag(key) {
    formula.value += `[${key}]`;
}

// ── Preview ───────────────────────────────────────────────────────────────────
function doPreview() {
    previewErr.value = '';
    const result = evalFormula(formula.value, lastValues.value);
    if (Number.isNaN(result)) {
        previewErr.value = 'Fórmula inválida o referencias incorrectas';
        previewVal.value = null;
    } else {
        previewVal.value = result.toFixed(4);
    }
}

// ── Agregar variable calculada ────────────────────────────────────────────────
function addCalcVar() {
    if (!varName.value.trim() || !formula.value.trim()) return;
    doPreview();
    if (previewErr.value) return;

    const newVar = {
        key:     `CALC_${Date.now()}`,
        tag:     varName.value.trim(),
        desc:    `Calc: ${formula.value}`,
        unidad:  varUnidad.value.trim(),
        formula: formula.value,
        tipo:    'Calc',
        min:     -Infinity,
        max:      Infinity,
        // generate mock values by applying formula to each data point
        _formula: formula.value,
        _baseTags: props.tags.map(t => t.key),
    };

    calcVars.value.push(newVar);
    emit('add-calc-var', newVar);

    // Reset form
    varName.value = '';
    varUnidad.value = '';
    formula.value = '';
    previewVal.value = null;
}

function removeCalcVar(cv) {
    calcVars.value = calcVars.value.filter(c => c.key !== cv.key);
    emit('remove-calc-var', cv.key);
}

// ── Operadores rápidos ────────────────────────────────────────────────────────
const OPERATORS = ['+', '-', '*', '/', '(', ')', 'Math.sqrt(', 'Math.log(', 'Math.abs('];
function insertOp(op) { formula.value += op; }
</script>

<template>
    <div class="vb-root flex flex-column h-full">

        <!-- Cabecera dock ──────────────────────────────────────────────── -->
        <div class="vb-header">
            <i class="pi pi-calculator" />
            <span>Constructor de Variables</span>
        </div>

        <!-- Tags activos ────────────────────────────────────────────────── -->
        <div class="vb-section">
            <div class="vb-section-title">Variables del análisis</div>
            <div v-if="!tags.length" class="vb-empty-msg">
                Agrega tags al análisis para usar en fórmulas
            </div>
            <div
                v-for="(tag, i) in tags"
                :key="tag.key"
                class="vb-tag-row"
                :title="`Clic para insertar [${tag.key}] en la fórmula`"
                @click="insertTag(tag.key)"
            >
                <span class="vb-dot" :style="`background:${TAG_COLORS[i % TAG_COLORS.length].border}`" />
                <span class="vb-tag-name">{{ tag.tag }}</span>
                <span class="vb-tag-val">
                    {{ lastValues[tag.key]?.toFixed(2) ?? '—' }}
                    <span class="vb-tag-unit">{{ tag.unidad }}</span>
                </span>
            </div>
        </div>

        <div class="vb-divider" />

        <!-- Editor de fórmula ────────────────────────────────────────────── -->
        <div class="vb-section flex-1 overflow-auto">
            <div class="vb-section-title">Nueva variable calculada</div>

            <!-- Nombre y unidad -->
            <div class="vb-field">
                <label class="vb-label">Nombre *</label>
                <input v-model="varName" class="vb-input" placeholder="Ej: TI-101_F" />
            </div>
            <div class="vb-field">
                <label class="vb-label">Unidad</label>
                <input v-model="varUnidad" class="vb-input" placeholder="Ej: °F, %" />
            </div>

            <!-- Operadores rápidos -->
            <div class="vb-field">
                <label class="vb-label">Operadores</label>
                <div class="vb-ops-row">
                    <button
                        v-for="op in OPERATORS"
                        :key="op"
                        class="vb-op-btn"
                        @click="insertOp(op)"
                    >{{ op }}</button>
                </div>
            </div>

            <!-- Tags para insertar rápido -->
            <div v-if="tags.length" class="vb-field">
                <label class="vb-label">Insertar tag</label>
                <div class="vb-ops-row">
                    <button
                        v-for="tag in tags"
                        :key="tag.key"
                        class="vb-tag-btn"
                        @click="insertTag(tag.key)"
                    >{{ tag.tag }}</button>
                </div>
            </div>

            <!-- Fórmula -->
            <div class="vb-field">
                <label class="vb-label">Fórmula * <span class="vb-hint">(usa [TAG] como referencia)</span></label>
                <textarea
                    v-model="formula"
                    class="vb-textarea"
                    rows="4"
                    placeholder="Ej: ([TI-101] - 273.15) * 9/5 + 32"
                    spellcheck="false"
                />
            </div>

            <!-- Botones -->
            <div class="vb-actions">
                <button class="vb-btn vb-btn-secondary" @click="doPreview">
                    <i class="pi pi-eye" /> Previsualizar
                </button>
                <button
                    class="vb-btn vb-btn-primary"
                    :disabled="!varName.trim() || !formula.trim()"
                    @click="addCalcVar"
                >
                    <i class="pi pi-plus" /> Agregar
                </button>
            </div>

            <!-- Preview result -->
            <div v-if="previewVal !== null" class="vb-preview">
                Resultado: <strong>{{ previewVal }}</strong>
                <span v-if="varUnidad"> {{ varUnidad }}</span>
            </div>
            <div v-if="previewErr" class="vb-preview-err">
                <i class="pi pi-times-circle" /> {{ previewErr }}
            </div>

            <!-- Ayuda de sintaxis -->
            <div class="vb-syntax-help">
                <div class="vb-section-title" style="margin-top:8px">Sintaxis</div>
                <table class="vb-syntax-table">
                    <tr><td>[TAG-KEY]</td><td>Valor del tag</td></tr>
                    <tr><td>+  -  *  /</td><td>Aritméticas</td></tr>
                    <tr><td>Math.sqrt(x)</td><td>Raíz cuadrada</td></tr>
                    <tr><td>Math.log(x)</td><td>Logaritmo natural</td></tr>
                    <tr><td>Math.abs(x)</td><td>Valor absoluto</td></tr>
                    <tr><td>(x + y) * z</td><td>Paréntesis</td></tr>
                </table>
            </div>
        </div>

        <!-- Variables calculadas creadas ────────────────────────────────── -->
        <div v-if="calcVars.length">
            <div class="vb-divider" />
            <div class="vb-section">
                <div class="vb-section-title">Calculadas activas ({{ calcVars.length }})</div>
                <div v-for="cv in calcVars" :key="cv.key" class="vb-cv-row">
                    <i class="pi pi-function vb-cv-icon" />
                    <div class="flex-1 min-w-0">
                        <div class="vb-cv-name">{{ cv.tag }}</div>
                        <div class="vb-cv-formula">{{ cv._formula }}</div>
                    </div>
                    <button class="vb-cv-del" @click="removeCalcVar(cv)">
                        <i class="pi pi-times" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.vb-root { background: var(--p-surface-50); font-family: 'Segoe UI', system-ui, sans-serif; }

/* ── Cabecera ──────────────────────────────────────────────────────────────── */
.vb-header {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 10px;
    background: var(--p-surface-100);
    border-bottom: 1px solid var(--p-surface-200);
    font-size: 0.72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--p-text-muted-color);
}

/* ── Secciones ─────────────────────────────────────────────────────────────── */
.vb-section { padding: 6px 10px; }
.vb-section-title {
    font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--p-text-muted-color); margin-bottom: 5px;
}
.vb-divider { height: 1px; background: var(--p-surface-200); margin: 0; }
.vb-empty-msg { font-size: 0.72rem; color: var(--p-text-muted-color); font-style: italic; padding: 4px 0; }

/* ── Tags activos ──────────────────────────────────────────────────────────── */
.vb-tag-row {
    display: flex; align-items: center; gap: 5px;
    padding: 3px 5px; border-radius: 3px; margin-bottom: 1px;
    cursor: pointer; font-size: 0.73rem;
}
.vb-tag-row:hover { background: var(--p-surface-200); }
.vb-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.vb-tag-name { flex: 1; font-family: monospace; font-weight: 600; }
.vb-tag-val  { font-size: 0.7rem; color: var(--p-text-muted-color); }
.vb-tag-unit { font-size: 0.65rem; margin-left: 2px; }

/* ── Formulario ────────────────────────────────────────────────────────────── */
.vb-field { margin-bottom: 7px; }
.vb-label {
    display: block; font-size: 0.68rem; font-weight: 600;
    color: var(--p-text-muted-color); margin-bottom: 2px;
}
.vb-hint { font-weight: 400; font-style: italic; }
.vb-input, .vb-textarea {
    width: 100%; padding: 4px 7px;
    border: 1px solid var(--p-surface-300); border-radius: 3px;
    font-size: 0.75rem; background: var(--p-surface-0); color: var(--p-text-color);
    outline: none; resize: vertical; font-family: 'Cascadia Code', monospace;
    box-sizing: border-box;
}
.vb-input:focus, .vb-textarea:focus { border-color: var(--p-primary-color); }

/* ── Operadores y tags rápidos ─────────────────────────────────────────────── */
.vb-ops-row { display: flex; flex-wrap: wrap; gap: 3px; }
.vb-op-btn, .vb-tag-btn {
    padding: 2px 6px; border: 1px solid var(--p-surface-300);
    border-radius: 3px; font-size: 0.68rem; background: var(--p-surface-100);
    color: var(--p-text-color); cursor: pointer; font-family: monospace;
}
.vb-op-btn:hover  { background: var(--p-surface-200); }
.vb-tag-btn       { background: var(--p-primary-50, #eff6ff); border-color: var(--p-primary-200, #bfdbfe); }
.vb-tag-btn:hover { background: var(--p-primary-100, #dbeafe); }

/* ── Botones de acción ─────────────────────────────────────────────────────── */
.vb-actions { display: flex; gap: 6px; margin-bottom: 8px; }
.vb-btn {
    flex: 1; padding: 5px 8px; border-radius: 3px;
    font-size: 0.73rem; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 4px;
    border: none;
}
.vb-btn-secondary { background: var(--p-surface-200); color: var(--p-text-color); }
.vb-btn-secondary:hover { background: var(--p-surface-300); }
.vb-btn-primary   { background: var(--p-primary-color); color: #fff; }
.vb-btn-primary:hover { opacity: 0.9; }
.vb-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Preview ───────────────────────────────────────────────────────────────── */
.vb-preview {
    padding: 5px 8px; background: #dcfce7; border: 1px solid #86efac;
    border-radius: 3px; font-size: 0.72rem; color: #15803d; margin-bottom: 5px;
}
.vb-preview-err {
    padding: 5px 8px; background: #fee2e2; border: 1px solid #fca5a5;
    border-radius: 3px; font-size: 0.72rem; color: #b91c1c; margin-bottom: 5px;
}

/* ── Sintaxis ──────────────────────────────────────────────────────────────── */
.vb-syntax-table {
    font-size: 0.68rem; width: 100%; border-collapse: collapse;
}
.vb-syntax-table td { padding: 2px 4px; }
.vb-syntax-table tr:nth-child(odd) td { background: var(--p-surface-100); }
.vb-syntax-table td:first-child { font-family: monospace; font-weight: 600; color: var(--p-primary-color); }

/* ── Calculadas activas ────────────────────────────────────────────────────── */
.vb-cv-row {
    display: flex; align-items: flex-start; gap: 5px;
    padding: 4px 5px; border-radius: 3px; margin-bottom: 2px;
    background: var(--p-surface-100); font-size: 0.72rem;
}
.vb-cv-icon  { color: var(--p-primary-color); margin-top: 2px; font-size: 0.75rem; }
.vb-cv-name  { font-weight: 700; font-family: monospace; }
.vb-cv-formula { color: var(--p-text-muted-color); font-size: 0.65rem; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vb-cv-del {
    background: none; border: none; cursor: pointer; color: var(--p-text-muted-color);
    padding: 0 2px; font-size: 0.65rem;
}
.vb-cv-del:hover { color: #ef4444; }
</style>
