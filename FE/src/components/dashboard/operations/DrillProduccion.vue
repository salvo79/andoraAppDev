<script setup>
import { ref, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import SectionCard from '@/components/ui/SectionCard.vue';

const { isDarkTheme } = useLayout();

// ── Plantas ────────────────────────────────────────────────────────────────
const plantas = ref([
    { id: 'P01', nombre: 'Planta Norte',    oee: 82, disponibilidad: 91, rendimiento: 88, calidad: 97, estado: 'Operando',  produccion: '1,240 ton/día', merma: 2.1 },
    { id: 'P02', nombre: 'Planta Sur',      oee: 71, disponibilidad: 85, rendimiento: 82, calidad: 96, estado: 'Atención',  produccion: '980 ton/día',   merma: 3.4 },
    { id: 'P03', nombre: 'Planta Central',  oee: 79, disponibilidad: 88, rendimiento: 87, calidad: 98, estado: 'Operando',  produccion: '1,100 ton/día', merma: 1.9 },
    { id: 'P04', nombre: 'Planta Occidente',oee: 65, disponibilidad: 78, rendimiento: 80, calidad: 95, estado: 'Crítico',   produccion: '650 ton/día',   merma: 5.2 },
    { id: 'P05', nombre: 'Planta Este',     oee: 88, disponibilidad: 94, rendimiento: 92, calidad: 99, estado: 'Operando',  produccion: '1,380 ton/día', merma: 1.2 }
]);

const selectedPlanta = ref(null);

function oeeColor(v) {
    if (v >= 85) return 'text-green-600 dark:text-green-400';
    if (v >= 70) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
}
function oeeBar(v) {
    if (v >= 85) return 'success';
    if (v >= 70) return 'warn';
    return 'danger';
}
function estadoSev(e) {
    const m = { Operando: 'success', Atención: 'warn', Crítico: 'danger' };
    return m[e] || 'info';
}

// ── OEE trend chart ────────────────────────────────────────────────────────
const dias = ['L','M','X','J','V','S','D'];
const oeeDatasets = [
    { label: 'P. Norte',     data: [80,83,82,84,82,81,82], borderColor: '#3b82f6',  backgroundColor: 'transparent' },
    { label: 'P. Sur',       data: [68,70,72,71,73,70,71], borderColor: '#f59e0b',  backgroundColor: 'transparent' },
    { label: 'P. Central',   data: [77,79,78,80,79,78,79], borderColor: '#14b8a6',  backgroundColor: 'transparent' },
    { label: 'P. Occidente', data: [60,63,65,64,66,63,65], borderColor: '#ef4444',  backgroundColor: 'transparent' },
    { label: 'P. Este',      data: [86,88,87,89,88,87,88], borderColor: '#22c55e',  backgroundColor: 'transparent' }
];

function buildOeeChart() {
    const grid  = isDarkTheme.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const label = isDarkTheme.value ? 'rgba(255,255,255,0.55)' : '#64748b';
    return {
        data: {
            labels: dias,
            datasets: oeeDatasets.map(d => ({
                ...d,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: label, boxWidth: 12, padding: 10, font: { size: 11 } }
                }
            },
            scales: {
                x: { grid: { color: grid }, ticks: { color: label } },
                y: {
                    grid: { color: grid },
                    ticks: { color: label, callback: v => v + '%' },
                    min: 55, max: 100,
                    title: { display: true, text: 'OEE %', color: label }
                }
            }
        }
    };
}

const oeeChart = ref(buildOeeChart());
watch(isDarkTheme, () => { oeeChart.value = buildOeeChart(); });

// ── Producción acumulada (bar horizontal) ──────────────────────────────────
function buildProdChart() {
    const grid  = isDarkTheme.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const label = isDarkTheme.value ? 'rgba(255,255,255,0.55)' : '#64748b';
    return {
        data: {
            labels: plantas.value.map(p => p.nombre.replace('Planta ', '')),
            datasets: [{
                label: 'Producción (ton/día)',
                data: [1240, 980, 1100, 650, 1380],
                backgroundColor: ['#3b82f6','#f59e0b','#14b8a6','#ef4444','#22c55e'],
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: grid }, ticks: { color: label } },
                y: { grid: { color: grid }, ticks: { color: label } }
            }
        }
    };
}

const prodChart = ref(buildProdChart());
watch(isDarkTheme, () => { prodChart.value = buildProdChart(); });
</script>

<template>
    <div class="flex flex-col gap-6">

        <!-- Global KPIs -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div class="card flex items-center gap-4">
                <i class="pi pi-cog text-2xl text-indigo-600 dark:text-indigo-400" />
                <div>
                    <p class="text-xl font-bold text-surface-950 dark:text-surface-0">78.4%</p>
                    <p class="text-xs text-surface-500 dark:text-white/60">OEE Global</p>
                </div>
            </div>
            <div class="card flex items-center gap-4">
                <i class="pi pi-bolt text-2xl text-green-600 dark:text-green-400" />
                <div>
                    <p class="text-xl font-bold text-surface-950 dark:text-surface-0">5,350 ton</p>
                    <p class="text-xs text-surface-500 dark:text-white/60">Producción Hoy</p>
                </div>
            </div>
            <div class="card flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-2xl text-amber-500 dark:text-amber-400" />
                <div>
                    <p class="text-xl font-bold text-surface-950 dark:text-surface-0">2</p>
                    <p class="text-xs text-surface-500 dark:text-white/60">Plantas con Alerta</p>
                </div>
            </div>
            <div class="card flex items-center gap-4">
                <i class="pi pi-chart-bar text-2xl text-blue-600 dark:text-blue-400" />
                <div>
                    <p class="text-xl font-bold text-surface-950 dark:text-surface-0">2.76%</p>
                    <p class="text-xs text-surface-500 dark:text-white/60">Merma Promedio</p>
                </div>
            </div>
        </div>

        <!-- Plant status cards -->
        <SectionCard>
            <template #title>Estado de Plantas</template>
            <template #description>OEE en tiempo real — Disponibilidad · Rendimiento · Calidad</template>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                <div
                    v-for="p in plantas"
                    :key="p.id"
                    class="card border cursor-pointer hover:shadow-md transition-all duration-200"
                    :class="p.estado === 'Crítico' ? 'border-red-300 dark:border-red-800/50' :
                            p.estado === 'Atención' ? 'border-amber-300 dark:border-amber-800/50' :
                            'border-surface-200 dark:border-white/8'"
                    @click="selectedPlanta = p"
                >
                    <div class="flex items-center justify-between mb-3">
                        <span class="font-semibold text-sm text-surface-950 dark:text-surface-0">{{ p.nombre }}</span>
                        <Tag :severity="estadoSev(p.estado)" :value="p.estado" class="text-xs" />
                    </div>

                    <!-- OEE big number -->
                    <p class="text-3xl font-bold mb-1" :class="oeeColor(p.oee)">{{ p.oee }}%</p>
                    <p class="text-xs text-surface-400 dark:text-white/40 mb-3">OEE</p>

                    <ProgressBar :value="p.oee" :showValue="false" class="mb-3 h-1.5" />

                    <!-- Sub-metrics -->
                    <div class="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p class="text-sm font-bold text-surface-950 dark:text-surface-0">{{ p.disponibilidad }}%</p>
                            <p class="text-xs text-surface-400 dark:text-white/40">Disp.</p>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-surface-950 dark:text-surface-0">{{ p.rendimiento }}%</p>
                            <p class="text-xs text-surface-400 dark:text-white/40">Rend.</p>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-surface-950 dark:text-surface-0">{{ p.calidad }}%</p>
                            <p class="text-xs text-surface-400 dark:text-white/40">Cal.</p>
                        </div>
                    </div>

                    <div class="mt-3 pt-3 border-t border-surface-100 dark:border-white/6 flex justify-between text-xs text-surface-500 dark:text-white/50">
                        <span>{{ p.produccion }}</span>
                        <span class="text-amber-500">Merma: {{ p.merma }}%</span>
                    </div>
                </div>
            </div>
        </SectionCard>

        <!-- Charts row -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div class="xl:col-span-2">
                <SectionCard>
                    <template #title>Tendencia OEE — Última Semana</template>
                    <template #description>Por planta, comparativo diario</template>
                    <div class="h-64 mt-3">
                        <Chart type="line" :data="oeeChart.data" :options="oeeChart.options" class="h-full" />
                    </div>
                </SectionCard>
            </div>
            <SectionCard>
                <template #title>Producción Diaria por Planta</template>
                <template #description>Toneladas / día hoy</template>
                <div class="h-64 mt-3">
                    <Chart type="bar" :data="prodChart.data" :options="prodChart.options" class="h-full" />
                </div>
            </SectionCard>
        </div>

        <!-- Detail dialog / slide-in -->
        <SectionCard v-if="selectedPlanta">
            <template #title>{{ selectedPlanta.nombre }} — Detalle</template>
            <template #action>
                <Button icon="pi pi-times" text rounded severity="secondary" @click="selectedPlanta = null" />
            </template>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div v-for="(val, key) in { OEE: selectedPlanta.oee + '%', Disponibilidad: selectedPlanta.disponibilidad + '%', Rendimiento: selectedPlanta.rendimiento + '%', Calidad: selectedPlanta.calidad + '%', 'Producción': selectedPlanta.produccion, Merma: selectedPlanta.merma + '%' }" :key="key" class="card text-center">
                    <p class="text-lg font-bold text-surface-950 dark:text-surface-0">{{ val }}</p>
                    <p class="text-xs text-surface-400 dark:text-white/40">{{ key }}</p>
                </div>
            </div>
        </SectionCard>

    </div>
</template>
