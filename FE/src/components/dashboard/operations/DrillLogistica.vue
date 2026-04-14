<script setup>
import { ref, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import SectionCard from '@/components/ui/SectionCard.vue';

const { isDarkTheme } = useLayout();

// ── KPIs ───────────────────────────────────────────────────────────────────
const kpis = [
    { label: 'On-Time Delivery', value: '91.7%', icon: 'pi pi-check-circle', color: 'text-green-600 dark:text-green-400' },
    { label: 'Movimientos Hoy',  value: '142',   icon: 'pi pi-truck',         color: 'text-cyan-600 dark:text-cyan-400' },
    { label: 'Envíos Retrasados',value: '8',     icon: 'pi pi-clock',         color: 'text-red-500 dark:text-red-400' },
    { label: 'Kg Transportados', value: '3,840 ton',icon: 'pi pi-box',        color: 'text-indigo-600 dark:text-indigo-400' }
];

// ── Movimientos recientes ─────────────────────────────────────────────────
const movimientos = ref([
    { folio:'MOV-2025-1042', tipo:'Salida',  origen:'ALM-01',        destino:'Cliente ABC',     producto:'PT-001', cantidad:'50 ton',  transportista:'Trans. Rápida',  estado:'Entregado',  fecha:'2025-04-04' },
    { folio:'MOV-2025-1041', tipo:'Entrada', origen:'Proveedor Norte',destino:'ALM-02',          producto:'MP-003', cantidad:'120 ton', transportista:'Fletes Norte',    estado:'En tránsito',fecha:'2025-04-04' },
    { folio:'MOV-2025-1040', tipo:'Salida',  origen:'ALM-02',        destino:'Cliente XYZ',     producto:'PT-003', cantidad:'30 ton',  transportista:'Trans. Rápida',  estado:'Retrasado',  fecha:'2025-04-03' },
    { folio:'MOV-2025-1039', tipo:'Traslado',origen:'ALM-01',        destino:'ALM-03',          producto:'PT-005', cantidad:'80 ton',  transportista:'Interno',        estado:'Entregado',  fecha:'2025-04-03' },
    { folio:'MOV-2025-1038', tipo:'Salida',  origen:'ALM-03',        destino:'Dist. Centro',    producto:'PT-002', cantidad:'25 ton',  transportista:'Fletes Sur',     estado:'Retrasado',  fecha:'2025-04-02' },
    { folio:'MOV-2025-1037', tipo:'Entrada', origen:'Proveedor Sur', destino:'ALM-01',          producto:'MP-001', cantidad:'200 ton', transportista:'Trans. Global',  estado:'Entregado',  fecha:'2025-04-02' },
    { folio:'MOV-2025-1036', tipo:'Salida',  origen:'ALM-02',        destino:'Cliente DEF',     producto:'PT-004', cantidad:'45 ton',  transportista:'Fletes Norte',   estado:'En tránsito',fecha:'2025-04-01' }
]);

const tipoIcon = { Salida: 'pi pi-sign-out', Entrada: 'pi pi-sign-in', Traslado: 'pi pi-arrows-h' };
const tipoColor = { Salida: 'text-blue-600 dark:text-blue-400', Entrada: 'text-green-600 dark:text-green-400', Traslado: 'text-amber-500 dark:text-amber-400' };
const estadoSev = { Entregado: 'success', 'En tránsito': 'info', Retrasado: 'danger' };

// ── OTD tendencia semanal ─────────────────────────────────────────────────
const semana = ['L','M','X','J','V','S','D'];
function buildOtdChart() {
    const grid  = isDarkTheme.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const label = isDarkTheme.value ? 'rgba(255,255,255,0.55)' : '#64748b';
    return {
        data: {
            labels: semana,
            datasets: [{
                label: 'OTD %',
                data: [93, 90, 88, 92, 91, 94, 91.7],
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6,182,212,0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#06b6d4'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: grid }, ticks: { color: label } },
                y: {
                    grid: { color: grid },
                    ticks: { color: label, callback: v => v + '%' },
                    min: 80, max: 100
                }
            }
        }
    };
}

const otdChart = ref(buildOtdChart());
watch(isDarkTheme, () => { otdChart.value = buildOtdChart(); });

// ── Movimientos por tipo (doughnut) ───────────────────────────────────────
const tipoChart = ref({
    data: {
        labels: ['Salidas a Cliente', 'Entradas de Proveedor', 'Traslados Internos'],
        datasets: [{
            data: [58, 28, 14],
            backgroundColor: ['#3b82f6','#22c55e','#f59e0b'],
            borderWidth: 0,
            hoverOffset: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#94a3b8', boxWidth: 12, padding: 10, font: { size: 11 } }
            }
        }
    }
});

// ── Kg por día (bar) ──────────────────────────────────────────────────────
function buildVolChart() {
    const grid  = isDarkTheme.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const label = isDarkTheme.value ? 'rgba(255,255,255,0.55)' : '#64748b';
    return {
        data: {
            labels: semana,
            datasets: [{
                label: 'Toneladas',
                data: [620,580,540,610,590,650,480],
                backgroundColor: 'rgba(6,182,212,0.7)',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: grid }, ticks: { color: label } },
                y: { grid: { color: grid }, ticks: { color: label, callback: v => v + ' ton' } }
            }
        }
    };
}

const volChart = ref(buildVolChart());
watch(isDarkTheme, () => { volChart.value = buildVolChart(); });
</script>

<template>
    <div class="flex flex-col gap-6">

        <!-- KPI strip -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div v-for="k in kpis" :key="k.label" class="card flex items-center gap-4">
                <i :class="[k.icon, k.color, 'text-2xl']" />
                <div>
                    <p class="text-xl font-bold text-surface-950 dark:text-surface-0">{{ k.value }}</p>
                    <p class="text-xs text-surface-500 dark:text-white/60">{{ k.label }}</p>
                </div>
            </div>
        </div>

        <!-- Charts row -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <SectionCard>
                <template #title>OTD — Última Semana</template>
                <template #description>On-Time Delivery diario (%)</template>
                <div class="h-52 mt-3">
                    <Chart type="line" :data="otdChart.data" :options="otdChart.options" class="h-full" />
                </div>
            </SectionCard>
            <SectionCard>
                <template #title>Movimientos por Tipo</template>
                <template #description>Distribución de operaciones logísticas</template>
                <div class="h-52 mt-3">
                    <Chart type="doughnut" :data="tipoChart.data" :options="tipoChart.options" class="h-full" />
                </div>
            </SectionCard>
            <SectionCard>
                <template #title>Volumen Transportado</template>
                <template #description>Toneladas por día — última semana</template>
                <div class="h-52 mt-3">
                    <Chart type="bar" :data="volChart.data" :options="volChart.options" class="h-full" />
                </div>
            </SectionCard>
        </div>

        <!-- Movements table -->
        <SectionCard>
            <template #title>Movimientos Logísticos Recientes</template>
            <template #description>Últimos 7 registros de tráfico de materiales</template>
            <template #action>
                <Button label="Ver todos" icon="pi pi-external-link" size="small" text />
            </template>

            <DataTable :value="movimientos" class="mt-3" size="small" striped-rows :rows="10" paginator paginator-template="PrevPageLink PageLinks NextPageLink">
                <Column field="folio"       header="Folio"      sortable />
                <Column field="tipo"        header="Tipo">
                    <template #body="{ data }">
                        <span class="flex items-center gap-2">
                            <i :class="[tipoIcon[data.tipo], tipoColor[data.tipo], 'text-sm']" />
                            <span :class="tipoColor[data.tipo]" class="font-medium text-sm">{{ data.tipo }}</span>
                        </span>
                    </template>
                </Column>
                <Column field="origen"      header="Origen"     />
                <Column field="destino"     header="Destino"    />
                <Column field="producto"    header="Producto"   />
                <Column field="cantidad"    header="Cantidad"   />
                <Column field="transportista" header="Transportista" />
                <Column field="fecha"       header="Fecha"      sortable />
                <Column field="estado"      header="Estado">
                    <template #body="{ data }">
                        <Tag :severity="estadoSev[data.estado]" :value="data.estado" />
                    </template>
                </Column>
            </DataTable>
        </SectionCard>

    </div>
</template>
