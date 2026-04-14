<script setup>
import { ref, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import SectionCard from '@/components/ui/SectionCard.vue';

const { isDarkTheme } = useLayout();

// ── KPIs ───────────────────────────────────────────────────────────────────
const kpis = [
    { label: 'Índice de Calidad',   value: '96.2%', icon: 'pi pi-verified',          color: 'text-teal-600 dark:text-teal-400' },
    { label: 'NC Abiertas',         value: '3',     icon: 'pi pi-exclamation-circle', color: 'text-red-500 dark:text-red-400' },
    { label: 'Lotes en Retención',  value: '1',     icon: 'pi pi-lock',               color: 'text-amber-500 dark:text-amber-400' },
    { label: 'Aprobación Laboratorio','value': '98.1%','icon':'pi pi-check-circle',    color: 'text-green-600 dark:text-green-400' }
];

// ── NC table ───────────────────────────────────────────────────────────────
const noConformidades = ref([
    { folio:'NC-0041', tipo:'Producto Terminado', descripcion:'Viscosidad fuera de especificación', planta:'P. Norte', estado:'Abierta',  fecha:'2025-04-01', responsable:'Q. González' },
    { folio:'NC-0040', tipo:'Corriente Interna',  descripcion:'Temperatura de proceso elevada',      planta:'P. Sur',   estado:'En proceso','fecha':'2025-03-28', responsable:'Ing. López' },
    { folio:'NC-0039', tipo:'Producto Terminado', descripcion:'Color fuera de rango',               planta:'P. Este',  estado:'Abierta',   fecha:'2025-03-25', responsable:'Q. Torres' },
    { folio:'NC-0038', tipo:'Materia Prima',      descripcion:'Pureza por debajo de 99%',           planta:'P. Central',estado:'Cerrada',  fecha:'2025-03-20', responsable:'Q. Martínez' },
    { folio:'NC-0037', tipo:'Corriente Interna',  descripcion:'pH fuera de rango aceptable',        planta:'P. Occidente',estado:'Cerrada',fecha:'2025-03-15', responsable:'Ing. Ramírez' }
]);

const ncSev = { Abierta: 'danger', 'En proceso': 'warn', Cerrada: 'success' };

// ── Corrientes (process streams quality) ──────────────────────────────────
const corrientes = ref([
    { nombre: 'Corriente A',  prueba: 'Viscosidad', valor: '245 cP',  min: 230, max: 260, resultado: 'OK',    lote: 'L-2025-0412' },
    { nombre: 'Corriente B',  prueba: 'Densidad',   valor: '0.89 g/cc',min:0.87,max:0.92,resultado: 'OK',     lote: 'L-2025-0411' },
    { nombre: 'Corriente C',  prueba: 'pH',         valor: '7.8',     min: 6.5, max: 7.5, resultado: 'Fuera', lote: 'L-2025-0410' },
    { nombre: 'Corriente D',  prueba: 'Temperatura',valor: '85 °C',   min: 80,  max: 90,  resultado: 'OK',    lote: 'L-2025-0409' },
    { nombre: 'Corriente E',  prueba: 'Pureza',     valor: '98.5%',   min: 99,  max: 100, resultado: 'Fuera', lote: 'L-2025-0408' }
]);

function resSev(r) {
    return r === 'OK' ? 'success' : 'danger';
}

// ── Calidad por mes (line chart) ───────────────────────────────────────────
const meses = ['Oct','Nov','Dic','Ene','Feb','Mar'];
function buildQChart() {
    const grid  = isDarkTheme.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const label = isDarkTheme.value ? 'rgba(255,255,255,0.55)' : '#64748b';
    return {
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Prod. Terminado',
                    data: [97.2, 96.8, 97.1, 95.9, 96.5, 96.2],
                    borderColor: '#14b8a6', backgroundColor: 'rgba(20,184,166,0.12)',
                    fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3
                },
                {
                    label: 'Corrientes Int.',
                    data: [95.1, 95.8, 96.0, 94.2, 95.3, 94.8],
                    borderColor: '#6366f1', backgroundColor: 'transparent',
                    tension: 0.4, borderWidth: 2, pointRadius: 3, borderDash: [4,4]
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
                    ticks: { color: label, callback: v => v + '%' },
                    min: 90, max: 100
                }
            }
        }
    };
}

const qChart = ref(buildQChart());
watch(isDarkTheme, () => { qChart.value = buildQChart(); });

// ── NC por tipo (doughnut) ─────────────────────────────────────────────────
const ncTypeChart = ref({
    data: {
        labels: ['Producto Terminado', 'Corriente Interna', 'Materia Prima', 'Proceso'],
        datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: ['#ef4444','#f59e0b','#6366f1','#14b8a6'],
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
                    <template #title>Índice de Calidad — Evolución Mensual</template>
                    <template #description>Producto terminado vs. corrientes de proceso</template>
                    <div class="h-56 mt-3">
                        <Chart type="line" :data="qChart.data" :options="qChart.options" class="h-full" />
                    </div>
                </SectionCard>
            </div>
            <SectionCard>
                <template #title>NC por Tipo</template>
                <template #description>Distribución histórica</template>
                <div class="h-56 mt-3">
                    <Chart type="doughnut" :data="ncTypeChart.data" :options="ncTypeChart.options" class="h-full" />
                </div>
            </SectionCard>
        </div>

        <!-- Corrientes de proceso -->
        <SectionCard>
            <template #title>Corrientes de Proceso — Resultados de Laboratorio</template>
            <template #description>Último análisis por corriente interna</template>

            <DataTable :value="corrientes" class="mt-3" size="small" striped-rows>
                <Column field="nombre"    header="Corriente" sortable />
                <Column field="lote"      header="Lote"      sortable />
                <Column field="prueba"    header="Prueba"    />
                <Column field="valor"     header="Valor Med." />
                <Column header="Rango Esp.">
                    <template #body="{ data }">
                        <span class="text-xs text-surface-500 dark:text-white/60">
                            {{ data.min }} – {{ data.max }}
                        </span>
                    </template>
                </Column>
                <Column field="resultado" header="Resultado">
                    <template #body="{ data }">
                        <Tag :severity="resSev(data.resultado)" :value="data.resultado" />
                    </template>
                </Column>
            </DataTable>
        </SectionCard>

        <!-- NC table -->
        <SectionCard>
            <template #title>No Conformidades Activas</template>
            <template #description>Seguimiento de hallazgos de calidad</template>
            <template #action>
                <Button label="Nueva NC" icon="pi pi-plus" size="small" severity="danger" outlined />
            </template>

            <DataTable :value="noConformidades" class="mt-3" size="small" striped-rows :rows="10" paginator paginator-template="PrevPageLink PageLinks NextPageLink">
                <Column field="folio"       header="Folio"       sortable />
                <Column field="tipo"        header="Tipo"        sortable />
                <Column field="descripcion" header="Descripción" />
                <Column field="planta"      header="Planta"      sortable />
                <Column field="responsable" header="Responsable" />
                <Column field="fecha"       header="Fecha"       sortable />
                <Column field="estado"      header="Estado">
                    <template #body="{ data }">
                        <Tag :severity="ncSev[data.estado]" :value="data.estado" />
                    </template>
                </Column>
            </DataTable>
        </SectionCard>

    </div>
</template>
