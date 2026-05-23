<script setup>
// VentasView.vue — Dashboard de Ventas
// Las colecciones facturacion / resumen_diario_ordenes aún no tienen datos.
</script>

<template>
    <div class="flex flex-col gap-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-surface-950 dark:text-surface-0">
                    Ventas
                </h2>
                <p class="text-sm text-surface-500 dark:text-white/60 mt-0.5">
                    Facturación · Clientes · Cumplimiento de objetivo
                </p>
            </div>
            <i class="pi pi-chart-line text-3xl text-green-400 dark:text-green-500" />
        </div>

        <!-- Sin datos -->
        <div class="card flex flex-col items-center justify-center gap-4 py-16 border border-dashed border-green-200 dark:border-green-800/50">
            <div class="w-16 h-16 rounded-2xl bg-green-100/40 dark:bg-green-900/20 flex items-center justify-center">
                <i class="pi pi-chart-line text-3xl text-green-500 dark:text-green-400" />
            </div>
            <div class="text-center">
                <p class="font-semibold text-surface-700 dark:text-surface-200 mb-1">
                    Sin datos de ventas aún
                </p>
                <p class="text-sm text-surface-400 dark:text-white/40 max-w-sm">
                    Carga las colecciones <code class="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">facturacion</code> y <code class="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">resumen_diario_ordenes</code> en andoraDB para activar este tablero.
                </p>
            </div>
        </div>

    </div>
</template>
