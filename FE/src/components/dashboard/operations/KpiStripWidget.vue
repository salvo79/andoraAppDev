<script setup>
import { ref, onMounted } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { operationsService } from '@/service/operationsService';

const emit = defineEmits(['open-module']);

const { isDarkTheme } = useLayout();

const loading = ref(true);
const error = ref(null);

// Íconos y colores fijos por módulo
const moduleMeta = {
    produccion: { icon: 'pi pi-cog',          color: 'indigo' },
    calidad:    { icon: 'pi pi-verified',      color: 'teal'   },
    paros:      { icon: 'pi pi-exclamation-triangle', color: 'amber' },
    compras:    { icon: 'pi pi-shopping-bag',  color: 'blue'   },
    inventario: { icon: 'pi pi-box',           color: 'cyan'   },
    ventas:     { icon: 'pi pi-chart-line',    color: 'green'  },
    logistica:  { icon: 'pi pi-truck',         color: 'cyan'   },
};

const kpis = ref([]);

async function loadKpis() {
    loading.value = true;
    error.value = null;
    try {
        const result = await operationsService.getKpis(30);
        kpis.value = result.kpis.map(k => ({
            ...k,
            icon:  moduleMeta[k.key]?.icon  ?? 'pi pi-chart-bar',
            color: moduleMeta[k.key]?.color ?? 'blue',
        }));
    } catch (err) {
        error.value = 'No se pudo cargar los KPIs de operaciones.';
        console.error('[KpiStripWidget]', err);
    } finally {
        loading.value = false;
    }
}

onMounted(loadKpis);

const colorMap = {
    blue:   { bg: 'bg-blue-100/40 dark:bg-blue-900/20',     icon: 'text-blue-600 dark:text-blue-400',     border: 'border-blue-200 dark:border-blue-800/50'   },
    indigo: { bg: 'bg-indigo-100/40 dark:bg-indigo-900/20', icon: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800/50' },
    teal:   { bg: 'bg-teal-100/40 dark:bg-teal-900/20',     icon: 'text-teal-600 dark:text-teal-400',     border: 'border-teal-200 dark:border-teal-800/50'   },
    amber:  { bg: 'bg-amber-100/40 dark:bg-amber-900/20',   icon: 'text-amber-600 dark:text-amber-400',   border: 'border-amber-200 dark:border-amber-800/50' },
    cyan:   { bg: 'bg-cyan-100/40 dark:bg-cyan-900/20',     icon: 'text-cyan-600 dark:text-cyan-400',     border: 'border-cyan-200 dark:border-cyan-800/50'   },
    green:  { bg: 'bg-green-100/40 dark:bg-green-900/20',   icon: 'text-green-600 dark:text-green-400',   border: 'border-green-200 dark:border-green-800/50' },
};

function deltaClass(val) {
    return val >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400';
}
function deltaIcon(val) {
    return val >= 0 ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right';
}
function deltaLabel(val) {
    return (val >= 0 ? '+' : '') + val.toFixed(1) + '%';
}
</script>

<template>
    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div v-for="n in 6" :key="n" class="card animate-pulse h-32 bg-surface-100 dark:bg-surface-800" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card text-red-500 flex items-center gap-2">
        <i class="pi pi-exclamation-circle" />
        {{ error }}
        <Button label="Reintentar" text size="small" @click="loadKpis" />
    </div>

    <!-- KPI cards -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div
            v-for="kpi in kpis"
            :key="kpi.key"
            class="card border transition-all duration-200"
            :class="[
                colorMap[kpi.color].border,
                kpi.hasData
                    ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5'
                    : 'opacity-50 cursor-not-allowed'
            ]"
            @click="kpi.hasData && emit('open-module', kpi.key)"
        >
            <!-- Icon + delta -->
            <div class="flex items-start justify-between mb-3">
                <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center"
                    :class="colorMap[kpi.color].bg"
                >
                    <i :class="[kpi.icon, 'text-lg', colorMap[kpi.color].icon]" />
                </div>
                <span
                    v-if="kpi.hasData && kpi.delta !== 0"
                    class="flex items-center gap-0.5 text-xs font-semibold"
                    :class="deltaClass(kpi.delta)"
                >
                    <i :class="deltaIcon(kpi.delta)" />
                    {{ deltaLabel(kpi.delta) }}
                </span>
            </div>

            <!-- Value -->
            <p class="text-2xl font-bold text-surface-950 dark:text-surface-0 leading-tight mb-0.5">
                {{ kpi.value }}
            </p>

            <!-- Label -->
            <p class="text-xs font-medium text-surface-500 dark:text-white/60 mb-1">
                {{ kpi.label }}
            </p>

            <!-- Sub -->
            <p class="text-xs text-surface-400 dark:text-white/40">
                {{ kpi.sub }}
            </p>

            <!-- Drill hint -->
            <div v-if="kpi.hasData" class="mt-3 flex items-center gap-1 text-xs" :class="colorMap[kpi.color].icon">
                <i class="pi pi-arrow-right text-xs" />
                <span>Ver detalle</span>
            </div>
        </div>
    </div>
</template>
