<script setup>
import { ref, computed, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import SectionCard from '@/components/ui/SectionCard.vue';

const { isDarkTheme } = useLayout();

// ── Mock data (replace with API via Pinia / axios) ─────────────────────────
const kpis = ref([
    { label: 'Gasto del Mes',      value: '$4.2M',  icon: 'pi pi-dollar',         color: 'text-blue-600 dark:text-blue-400' },
    { label: 'OCs Activas',        value: '18',     icon: 'pi pi-file-edit',      color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Proveedores Activos',value: '6',      icon: 'pi pi-building',       color: 'text-teal-600 dark:text-teal-400' },
    { label: 'OCs Vencidas',       value: '2',      icon: 'pi pi-exclamation-triangle', color: 'text-red-500 dark:text-red-400' }
]);

const ordenes = ref([
    { folio: 'OC-2025-0312', proveedor: 'Químicos del Norte', producto: 'Solvente A',    cantidad: '2,000 kg', monto: '$180,000', estado: 'Pendiente',  vencimiento: '2025-04-10' },
    { folio: 'OC-2025-0311', proveedor: 'Distribuidora XYZ',  producto: 'Catalizador B', cantidad: '500 kg',   monto: '$95,000',  estado: 'Recibida',   vencimiento: '2025-04-05' },
    { folio: 'OC-2025-0310', proveedor: 'Insumos del Bajío',  producto: 'Aditivo C',     cantidad: '1,200 kg', monto: '$62,000',  estado: 'En tránsito',vencimiento: '2025-04-08' },
    { folio: 'OC-2025-0309', proveedor: 'Químicos del Norte', producto: 'Base D',        cantidad: '800 kg',   monto: '$44,000',  estado: 'Vencida',    vencimiento: '2025-04-01' },
    { folio: 'OC-2025-0308', proveedor: 'Proveedor Sur',      producto: 'Materia Prima E','cantidad': '3,500 kg',monto: '$210,000',estado: 'Recibida',   vencimiento: '2025-03-28' }
]);

const estadoSev = {
    Pendiente:    'warn',
    Recibida:     'success',
    'En tránsito':'info',
    Vencida:      'danger'
};

// ── Gasto mensual chart (últimos 6 meses) ──────────────────────────────────
const meses = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'];
const gastoData = [3.1, 3.8, 4.0, 3.5, 3.9, 4.2];

function buildChart() {
    const grid  = isDarkTheme.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const label = isDarkTheme.value ? 'rgba(255,255,255,0.55)' : '#64748b';
    return {
        data: {
            labels: meses,
            datasets: [{
                label: 'Gasto ($M)',
                data: gastoData,
                backgroundColor: 'rgba(59,130,246,0.25)',
                borderColor:     '#3b82f6',
                borderWidth: 2,
                borderRadius: 6,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` $${ctx.parsed.y}M`
                    }
                }
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

const chart = ref(buildChart());

watch(isDarkTheme, () => {
    chart.value = buildChart();
});

// ── Gasto por proveedor (doughnut) ─────────────────────────────────────────
const provChart = ref({
    data: {
        labels: ['Químicos del Norte', 'Distribuidora XYZ', 'Insumos del Bajío', 'Proveedor Sur', 'Otros'],
        datasets: [{
            data: [35, 22, 18, 15, 10],
            backgroundColor: ['#3b82f6','#6366f1','#14b8a6','#f59e0b','#94a3b8'],
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
                labels: { color: '#94a3b8', boxWidth: 12, padding: 12 }
            },
            tooltip: {
                callbacks: {
                    label: ctx => ` ${ctx.label}: ${ctx.parsed}%`
                }
            }
        }
    }
});
</script>

<template>
    <div class="flex flex-col gap-6">

        <!-- KPI mini-strip -->
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

            <!-- Gasto mensual -->
            <div class="xl:col-span-2">
                <SectionCard>
                    <template #title>Evolución de Gasto Mensual</template>
                    <template #description>Últimos 6 meses — Ordenes de compra confirmadas</template>
                    <div class="h-56 mt-3">
                        <Chart type="bar" :data="chart.data" :options="chart.options" class="h-full" />
                    </div>
                </SectionCard>
            </div>

            <!-- Por proveedor -->
            <SectionCard>
                <template #title>Gasto por Proveedor</template>
                <template #description>Distribución % mes actual</template>
                <div class="h-56 mt-3">
                    <Chart type="doughnut" :data="provChart.data" :options="provChart.options" class="h-full" />
                </div>
            </SectionCard>

        </div>

        <!-- OC Table -->
        <SectionCard>
            <template #title>Órdenes de Compra Activas</template>
            <template #description>Estado actual de compras en curso</template>
            <template #action>
                <Button label="Nueva OC" icon="pi pi-plus" size="small" />
            </template>

            <DataTable
                :value="ordenes"
                class="mt-3"
                size="small"
                striped-rows
                :rows="10"
                paginator
                paginator-template="PrevPageLink PageLinks NextPageLink"
            >
                <Column field="folio"      header="Folio"      sortable />
                <Column field="proveedor"  header="Proveedor"  sortable />
                <Column field="producto"   header="Producto"   sortable />
                <Column field="cantidad"   header="Cantidad"   />
                <Column field="monto"      header="Monto"      sortable />
                <Column field="vencimiento" header="Vencimiento" sortable />
                <Column field="estado"     header="Estado">
                    <template #body="{ data }">
                        <Tag :severity="estadoSev[data.estado]" :value="data.estado" />
                    </template>
                </Column>
            </DataTable>
        </SectionCard>

    </div>
</template>
