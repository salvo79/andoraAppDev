<script setup>
import { ref, computed, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import SectionCard from '@/components/ui/SectionCard.vue';

const { isDarkTheme } = useLayout();

// ── KPIs ───────────────────────────────────────────────────────────────────
const kpis = [
    { label: 'Cobertura Promedio', value: '14 días', icon: 'pi pi-calendar',    color: 'text-amber-500 dark:text-amber-400' },
    { label: 'Alertas de Mínimo',  value: '2',       icon: 'pi pi-bell',         color: 'text-red-500 dark:text-red-400' },
    { label: 'Valor en Stock',     value: '$8.4M',   icon: 'pi pi-dollar',       color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Rotación Mensual',   value: '2.4x',    icon: 'pi pi-sync',         color: 'text-green-600 dark:text-green-400' }
];

// ── Inventario de productos terminados ────────────────────────────────────
const productosTerminados = ref([
    { sku: 'PT-001', nombre: 'Producto Alpha',  almacen: 'ALM-01', stock: 450,  unidad:'ton', min: 200, max: 800, cobertura: 18, estado: 'Normal' },
    { sku: 'PT-002', nombre: 'Producto Beta',   almacen: 'ALM-01', stock: 80,   unidad:'ton', min: 150, max: 600, cobertura: 5,  estado: 'Crítico' },
    { sku: 'PT-003', nombre: 'Producto Gamma',  almacen: 'ALM-02', stock: 320,  unidad:'ton', min: 100, max: 500, cobertura: 16, estado: 'Normal' },
    { sku: 'PT-004', nombre: 'Producto Delta',  almacen: 'ALM-02', stock: 190,  unidad:'ton', min: 200, max: 700, cobertura: 9,  estado: 'Bajo' },
    { sku: 'PT-005', nombre: 'Producto Epsilon',almacen: 'ALM-03', stock: 560,  unidad:'ton', min: 100, max: 600, cobertura: 22, estado: 'Normal' }
]);

// ── Corrientes internas ────────────────────────────────────────────────────
const corrientesInv = ref([
    { id: 'C-A', nombre: 'Corriente A',   planta: 'P. Norte',    stock: 120, unidad:'m³', min: 80,  max: 200, estado: 'Normal' },
    { id: 'C-B', nombre: 'Corriente B',   planta: 'P. Sur',      stock: 35,  unidad:'m³', min: 50,  max: 150, estado: 'Crítico' },
    { id: 'C-C', nombre: 'Corriente C',   planta: 'P. Central',  stock: 88,  unidad:'m³', min: 60,  max: 180, estado: 'Normal' },
    { id: 'C-D', nombre: 'Corriente D',   planta: 'P. Occidente',stock: 42,  unidad:'m³', min: 40,  max: 120, estado: 'Bajo' },
    { id: 'C-E', nombre: 'Corriente E',   planta: 'P. Este',     stock: 95,  unidad:'m³', min: 70,  max: 200, estado: 'Normal' }
]);

function stockPct(item) {
    return Math.round((item.stock / item.max) * 100);
}
function stockSev(e) {
    return e === 'Normal' ? 'success' : e === 'Bajo' ? 'warn' : 'danger';
}

// ── Evolución de stock (línea) ─────────────────────────────────────────────
const semana = ['L','M','X','J','V','S','D'];
function buildStockChart() {
    const grid  = isDarkTheme.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const label = isDarkTheme.value ? 'rgba(255,255,255,0.55)' : '#64748b';
    return {
        data: {
            labels: semana,
            datasets: [
                {
                    label: 'Prod. Alpha',
                    data: [500,480,462,445,432,460,450],
                    borderColor: '#3b82f6', backgroundColor: 'transparent',
                    tension: 0.4, borderWidth: 2, pointRadius: 3
                },
                {
                    label: 'Prod. Beta',
                    data: [120,110,100,92,85,82,80],
                    borderColor: '#ef4444', backgroundColor: 'transparent',
                    tension: 0.4, borderWidth: 2, pointRadius: 3
                },
                {
                    label: 'Prod. Gamma',
                    data: [310,320,315,325,318,320,320],
                    borderColor: '#14b8a6', backgroundColor: 'transparent',
                    tension: 0.4, borderWidth: 2, pointRadius: 3
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
                }
            },
            scales: {
                x: { grid: { color: grid }, ticks: { color: label } },
                y: {
                    grid: { color: grid },
                    ticks: { color: label, callback: v => v + ' ton' }
                }
            }
        }
    };
}

const stockChart = ref(buildStockChart());
watch(isDarkTheme, () => { stockChart.value = buildStockChart(); });

// ── Stock por almacén (bar) ────────────────────────────────────────────────
function buildAlmChart() {
    const grid  = isDarkTheme.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const label = isDarkTheme.value ? 'rgba(255,255,255,0.55)' : '#64748b';
    return {
        data: {
            labels: ['ALM-01','ALM-02','ALM-03'],
            datasets: [
                {
                    label: 'Stock Actual (ton)',
                    data: [530, 510, 560],
                    backgroundColor: 'rgba(59,130,246,0.7)',
                    borderRadius: 6
                },
                {
                    label: 'Capacidad Máx.',
                    data: [1400, 1200, 600],
                    backgroundColor: 'rgba(59,130,246,0.15)',
                    borderRadius: 6
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
                }
            },
            scales: {
                x: { grid: { color: grid }, ticks: { color: label } },
                y: { grid: { color: grid }, ticks: { color: label, callback: v => v + ' ton' } }
            }
        }
    };
}

const almChart = ref(buildAlmChart());
watch(isDarkTheme, () => { almChart.value = buildAlmChart(); });
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

        <!-- Charts -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div class="xl:col-span-2">
                <SectionCard>
                    <template #title>Evolución de Stock — Última Semana</template>
                    <template #description>Principales productos terminados</template>
                    <div class="h-56 mt-3">
                        <Chart type="line" :data="stockChart.data" :options="stockChart.options" class="h-full" />
                    </div>
                </SectionCard>
            </div>
            <SectionCard>
                <template #title>Ocupación por Almacén</template>
                <template #description>Stock actual vs. capacidad máxima</template>
                <div class="h-56 mt-3">
                    <Chart type="bar" :data="almChart.data" :options="almChart.options" class="h-full" />
                </div>
            </SectionCard>
        </div>

        <!-- Productos terminados -->
        <SectionCard>
            <template #title>Inventario — Productos Terminados</template>
            <template #description>Nivel de stock por SKU con alertas de mínimo</template>

            <DataTable :value="productosTerminados" class="mt-3" size="small" striped-rows>
                <Column field="sku"        header="SKU"       sortable />
                <Column field="nombre"     header="Producto"  sortable />
                <Column field="almacen"    header="Almacén"   />
                <Column header="Stock">
                    <template #body="{ data }">
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="font-semibold text-surface-950 dark:text-surface-0 text-sm">
                                    {{ data.stock }} {{ data.unidad }}
                                </span>
                                <span class="text-xs text-surface-400 dark:text-white/40">
                                    mín {{ data.min }}
                                </span>
                            </div>
                            <ProgressBar :value="stockPct(data)" :showValue="false" class="h-1.5" />
                        </div>
                    </template>
                </Column>
                <Column field="cobertura"  header="Cobertura (días)" sortable />
                <Column field="estado"     header="Estado">
                    <template #body="{ data }">
                        <Tag :severity="stockSev(data.estado)" :value="data.estado" />
                    </template>
                </Column>
            </DataTable>
        </SectionCard>

        <!-- Corrientes internas -->
        <SectionCard>
            <template #title>Inventario — Corrientes de Proceso</template>
            <template #description>Nivel actual de corrientes internas por planta</template>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                <div v-for="c in corrientesInv" :key="c.id" class="card border"
                     :class="c.estado === 'Crítico' ? 'border-red-300 dark:border-red-800/50' :
                             c.estado === 'Bajo' ? 'border-amber-300 dark:border-amber-800/50' :
                             'border-surface-200 dark:border-white/8'">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-semibold text-sm text-surface-950 dark:text-surface-0">{{ c.nombre }}</span>
                        <Tag :severity="stockSev(c.estado)" :value="c.estado" class="text-xs" />
                    </div>
                    <p class="text-xs text-surface-400 dark:text-white/40 mb-3">{{ c.planta }}</p>
                    <div class="flex items-end justify-between mb-1">
                        <span class="text-2xl font-bold text-surface-950 dark:text-surface-0">{{ c.stock }}</span>
                        <span class="text-xs text-surface-400 dark:text-white/40">{{ c.unidad }}</span>
                    </div>
                    <ProgressBar :value="stockPct(c)" :showValue="false" class="h-1.5 mb-1" />
                    <p class="text-xs text-surface-400 dark:text-white/40">Mín {{ c.min }} · Máx {{ c.max }} {{ c.unidad }}</p>
                </div>
            </div>
        </SectionCard>

    </div>
</template>
