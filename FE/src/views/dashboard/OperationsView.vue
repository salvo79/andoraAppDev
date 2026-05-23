<script setup>
import { ref } from 'vue';
import KpiStripWidget from '@/components/dashboard/operations/KpiStripWidget.vue';
import ValueChainWidget from '@/components/dashboard/operations/ValueChainWidget.vue';
import DrillCompras from '@/components/dashboard/operations/DrillCompras.vue';
import DrillProduccion from '@/components/dashboard/operations/DrillProduccion.vue';
import DrillCalidad from '@/components/dashboard/operations/DrillCalidad.vue';
import DrillInventario from '@/components/dashboard/operations/DrillInventario.vue';
import DrillLogistica from '@/components/dashboard/operations/DrillLogistica.vue';
import DrillVentas from '@/components/dashboard/operations/DrillVentas.vue';

const activeModule = ref(null);

const moduleComponents = {
    compras: DrillCompras,
    produccion: DrillProduccion,
    calidad: DrillCalidad,
    inventario: DrillInventario,
    logistica: DrillLogistica,
    ventas: DrillVentas
};

const moduleLabels = {
    compras: 'Compras & Proveedores',
    produccion: 'Producción & Plantas',
    calidad: 'Calidad',
    inventario: 'Inventarios',
    logistica: 'Logística',
    ventas: 'Ventas'
};

function openModule(name) {
    activeModule.value = name;
}

function closeModule() {
    activeModule.value = null;
}
</script>

<template>
    <div class="flex flex-col gap-6">

        <!-- KPI Strip always visible -->
        <KpiStripWidget @open-module="openModule" />

        <!-- Drill-down panel (transition in/out) -->
        <Transition name="drill" mode="out-in">
            <div v-if="activeModule" :key="activeModule">
                <!-- Breadcrumb header -->
                <div class="flex items-center gap-3 mb-4">
                    <Button
                        icon="pi pi-arrow-left"
                        severity="secondary"
                        text
                        rounded
                        @click="closeModule"
                        v-tooltip.right="'Volver al resumen'"
                    />
                    <span class="text-surface-500 dark:text-white/60 text-sm">
                        Dashboard Operaciones
                    </span>
                    <i class="pi pi-angle-right text-surface-400 dark:text-white/40 text-xs" />
                    <span class="text-surface-950 dark:text-surface-0 font-semibold text-sm">
                        {{ moduleLabels[activeModule] }}
                    </span>
                </div>

                <!-- Dynamic drill-down component -->
                <component :is="moduleComponents[activeModule]" />
            </div>

            <!-- Value chain + module grid when no drill-down is open -->
            <div v-else key="overview" class="flex flex-col gap-6">
                <ValueChainWidget @open-module="openModule" />
            </div>
        </Transition>

    </div>
</template>

<style scoped>
.drill-enter-active,
.drill-leave-active {
    transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.drill-enter-from {
    opacity: 0;
    transform: translateY(12px);
}
.drill-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
