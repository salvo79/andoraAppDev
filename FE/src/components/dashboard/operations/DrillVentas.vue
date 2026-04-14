<script setup>
import { ref, computed, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import SectionCard from '@/components/ui/SectionCard.vue';

const { isDarkTheme } = useLayout();

// ── KPIs ───────────────────────────────────────────────────────────────────
const kpis = [
    { label: 'Ventas del Mes',   value: '$6.8M',  icon: 'pi pi-chart-line', color: 'text-green-600 dark:text-green-400' },
    { label: 'Objetivo Mensual', value: '$7.8M',  icon: 'pi pi-bullseye',   color: 'text-blue-600 dark:text-blue-400' },
    { label: '% del Objetivo',   value: '87.2%',  icon: 'pi pi-percentage', color: 'text-amber-500 dark:text-amber-400' },
    { label: 'Ticket Promedio',  value: '$48.2K', icon: 'pi pi-receipt',    color: 'text-indigo-600 dark:text-indigo-400' }
];

// ── Tabs for sub-views ─────────────────────────────────────────────────────
const activeTab = ref('vendedores');
const tabs = [
    { key: 'vendedores', label: 'Por Vendedor',  icon: 'pi pi-user' },
    { key: 'productos',  label: 'Por Producto',  icon: 'pi pi-box' },
    { key: 'clientes',   label: 'Por Cliente',   icon: 'pi pi-building' },
    { key: 'canal',      label: 'Por Canal',     icon: 'pi pi-share-alt' }
];

// ── By vendedor ────────────────────────────────────────────────────────────
const vendedores = ref([
    { nombre: 'Carlos Mendoza', region: 'Norte',  ventas: 1240000, objetivo: 1400000, clientes: 18, pedidos: 42 },
    { nombre: 'Ana López',      region: 'Centro', ventas: 1580000, objetivo: 1500000, clientes: 22, pedidos: 58 },
    { nombre: 'Héctor Ruiz',    region: 'Sur',    ventas: 980000,  objetivo: 1200000, clientes: 15, pedidos: 31 },
    { nombre: 'Patricia Gómez', region: 'Bajío',  ventas: 1120000, objetivo: 1100000, clientes: 20, pedidos: 44 },
    { nombre: 'Miguel Torres',  region: 'Occid.', ventas: 860000,  objetivo: 1000000, clientes: 12, pedidos: 27 },
    { nombre: 'Lucía Fernández',region: 'CDMX',   ventas: 1020000, objetivo: 1000000, clientes: 19, pedidos: 38 }
]);

// ── By producto ────────────────────────────────────────────────────────────
const productos = ref([
    { sku: 'PT-001', nombre: 'Producto Alpha',   ventas: 2100000, unidades: '420 ton', margen: 32, canal: 'Directo' },
    { sku: 'PT-002', nombre: 'Producto Beta',    ventas: 1400000, unidades: '210 ton', margen: 28, canal: 'Distribuidor' },
    { sku: 'PT-003', nombre: 'Producto Gamma',   ventas: 1700000, unidades: '340 ton', margen: 35, canal: 'Mixto' },
    { sku: 'PT-004', nombre: 'Producto Delta',   ventas: 980000,  unidades: '160 ton', margen: 22, canal: 'Distribuidor' },
    { sku: 'PT-005', nombre: 'Producto Epsilon', ventas: 620000,  unidades: '95 ton',  margen: 41, canal: 'Directo' }
]);

// ── By cliente ────────────────────────────────────────────────────────────
const clientes = ref([
    { nombre: 'Industrias ABC',    sector: 'Automotriz',  ventas: 1280000, pedidos: 8,  estadoCuenta: 'Al corriente', diasCredito: 30 },
    { nombre: 'Grupo XYZ',         sector: 'Construcción',ventas: 960000,  pedidos: 6,  estadoCuenta: 'Vencida 15d',  diasCredito: 45 },
    { nombre: 'Manufactura DEF',   sector: 'Industrial',  ventas: 1480000, pedidos: 11, estadoCuenta: 'Al corriente', diasCredito: 30 },
    { nombre: 'Distribuidora Sur', sector: 'Distribución',ventas: 720000,  pedidos: 5,  estadoCuenta: 'Al corriente', diasCredito: 60 },
    { nombre: 'Comercial Norte',   sector: 'Comercio',    ventas: 540000,  pedidos: 4,  estadoCuenta: 'Vencida 5d',   diasCredito: 30 },
    { nombre: 'Chem Solutions',    sector: 'Químico',     ventas: 1820000, pedidos: 14, estadoCuenta: 'Al corriente', diasCredito: 45 }
]);

const cuentaSev = (e) => e === 'Al corriente' ? 'success' : 'danger';

// ── By canal ──────────────────────────────────────────────────────────────
const canales = ref([
    { canal: 'Venta Directa',   ventas: 3200000, pct: 47, clientes: 18, margen: 35 },
    { canal: 'Distribuidor',    ventas: 2400000, pct: 35, clientes: 12, margen: 28 },
    { canal: 'Exportación',     ventas: 800000,  pct: 12, clientes: 4,  margen: 38 },
    { canal: 'E-Commerce',      ventas: 400000,  pct: 6,  clientes: 28, margen: 42 }
]);

// ── Monthly trend chart ────────────────────────────────────────────────────
const meses = ['Oct','Nov','Dic','Ene','Feb','Mar'];
function buildVtaChart() {
    const grid  = isDarkTheme.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const label = isDarkTheme.value ? 'rgba(255,255,255,0.55)' : '#64748b';
    return {
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Ventas Reales',
                    data: [5.9, 6.1, 7.2, 5.8, 6.4, 6.8],
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34,197,94,0.15)',
                    fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4,
                    pointBackgroundColor: '#22c55e'
                },
                {
                    label: 'Objetivo',
                    data: [6.5, 6.5, 7.0, 7.0, 7.5, 7.8],
                    borderColor: '#94a3b8',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5], tension: 0.4, borderWidth: 1.5, pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: label, boxWidth: 12, padding: 10, font: { size: 11 } }
                },
                tooltip: { callbacks: { label: ctx => ` $${ctx.parsed.y}M` } }
            },
            scales: {
                x: { grid: { color: grid }, ticks: { color: label } },
                y: {
                    grid: { color: grid },
                    ticks: { color: label, callback: v => `$${v}M` }
                }
            }
        }
    };
}

const vtaChart = ref(buildVtaChart());
watch(isDarkTheme, () => { vtaChart.value = buildVtaChart(); });

// ── Canal pie chart ────────────────────────────────────────────────────────
const canalChart = ref({
    data: {
        labels: ['Venta Directa', 'Distribuidor', 'Exportación', 'E-Commerce'],
        datasets: [{
            data: [47, 35, 12, 6],
            backgroundColor: ['#22c55e','#3b82f6','#f59e0b','#a855f7'],
            borderWidth: 0,
            hoverOffset: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: { color: '#94a3b8', boxWidth: 12, padding: 10, font: { size: 11 } }
            }
        }
    }
});

function pct(val, obj) { return Math.round((val / obj) * 100); }
function pctSev(v) { return v >= 100 ? 'success' : v >= 80 ? 'warn' : 'danger'; }
function formatM(val) { return '$' + (val / 1000000).toFixed(2) + 'M'; }
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
            <div class="xl:col-span-2">
                <SectionCard>
                    <template #title>Ventas vs. Objetivo — Mensual</template>
                    <template #description>Últimos 6 meses ($M)</template>
                    <div class="h-56 mt-3">
                        <Chart type="line" :data="vtaChart.data" :options="vtaChart.options" class="h-full" />
                    </div>
                </SectionCard>
            </div>
            <SectionCard>
                <template #title>Mix por Canal</template>
                <template #description>Participación en ventas del mes</template>
                <div class="h-56 mt-3">
                    <Chart type="doughnut" :data="canalChart.data" :options="canalChart.options" class="h-full" />
                </div>
            </SectionCard>
        </div>

        <!-- Sub-tabs -->
        <SectionCard>
            <template #title>Análisis de Ventas</template>
            <template #description>Desglose por vendedor, producto, cliente y canal de distribución</template>

            <!-- Tab selector -->
            <div class="flex gap-2 mt-4 mb-5 flex-wrap">
                <button
                    v-for="t in tabs"
                    :key="t.key"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                    :class="activeTab === t.key
                        ? 'bg-primary text-white'
                        : 'bg-surface-100 dark:bg-white/6 text-surface-600 dark:text-white/60 hover:bg-surface-200 dark:hover:bg-white/10'"
                    @click="activeTab = t.key"
                >
                    <i :class="[t.icon, 'text-xs']" />
                    {{ t.label }}
                </button>
            </div>

            <!-- By Vendedor -->
            <DataTable v-if="activeTab === 'vendedores'" :value="vendedores" size="small" striped-rows>
                <Column field="nombre"   header="Vendedor"  sortable />
                <Column field="region"   header="Región"    sortable />
                <Column header="Ventas vs. Objetivo">
                    <template #body="{ data }">
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="font-semibold text-sm text-surface-950 dark:text-surface-0">
                                    {{ formatM(data.ventas) }}
                                </span>
                                <Tag :severity="pctSev(pct(data.ventas, data.objetivo))"
                                     :value="pct(data.ventas, data.objetivo) + '%'" class="text-xs" />
                            </div>
                            <ProgressBar :value="pct(data.ventas, data.objetivo)" :showValue="false" class="h-1.5" />
                            <p class="text-xs text-surface-400 dark:text-white/40 mt-0.5">Obj: {{ formatM(data.objetivo) }}</p>
                        </div>
                    </template>
                </Column>
                <Column field="clientes" header="Clientes" sortable />
                <Column field="pedidos"  header="Pedidos"  sortable />
            </DataTable>

            <!-- By Producto -->
            <DataTable v-else-if="activeTab === 'productos'" :value="productos" size="small" striped-rows>
                <Column field="sku"      header="SKU"      sortable />
                <Column field="nombre"   header="Producto" sortable />
                <Column field="canal"    header="Canal"    />
                <Column header="Ventas">
                    <template #body="{ data }">
                        <span class="font-semibold text-surface-950 dark:text-surface-0">{{ formatM(data.ventas) }}</span>
                    </template>
                </Column>
                <Column field="unidades" header="Volumen"  />
                <Column header="Margen">
                    <template #body="{ data }">
                        <span :class="data.margen >= 35 ? 'text-green-600 dark:text-green-400' : data.margen >= 28 ? 'text-amber-500 dark:text-amber-400' : 'text-red-500 dark:text-red-400'"
                              class="font-semibold">
                            {{ data.margen }}%
                        </span>
                    </template>
                </Column>
            </DataTable>

            <!-- By Cliente -->
            <DataTable v-else-if="activeTab === 'clientes'" :value="clientes" size="small" striped-rows>
                <Column field="nombre"       header="Cliente"       sortable />
                <Column field="sector"       header="Sector"        />
                <Column header="Ventas">
                    <template #body="{ data }">
                        <span class="font-semibold text-surface-950 dark:text-surface-0">{{ formatM(data.ventas) }}</span>
                    </template>
                </Column>
                <Column field="pedidos"      header="Pedidos"       sortable />
                <Column field="diasCredito"  header="Crédito (días)"/>
                <Column field="estadoCuenta" header="Estado Cuenta">
                    <template #body="{ data }">
                        <Tag :severity="cuentaSev(data.estadoCuenta)" :value="data.estadoCuenta" />
                    </template>
                </Column>
            </DataTable>

            <!-- By Canal -->
            <div v-else-if="activeTab === 'canal'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="c in canales" :key="c.canal"
                     class="card border border-surface-200 dark:border-white/8">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-semibold text-surface-950 dark:text-surface-0">{{ c.canal }}</span>
                        <span class="text-sm font-bold text-green-600 dark:text-green-400">{{ c.pct }}%</span>
                    </div>
                    <p class="text-2xl font-bold text-surface-950 dark:text-surface-0 mb-0.5">{{ formatM(c.ventas) }}</p>
                    <ProgressBar :value="c.pct" :showValue="false" class="h-1.5 mb-3" />
                    <div class="flex gap-4 text-xs text-surface-500 dark:text-white/50">
                        <span>{{ c.clientes }} clientes</span>
                        <span>Margen: {{ c.margen }}%</span>
                    </div>
                </div>
            </div>

        </SectionCard>

    </div>
</template>
