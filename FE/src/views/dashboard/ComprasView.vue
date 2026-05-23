<script setup>
// ComprasView.vue — Dashboard de Compras & Proveedores
// Las colecciones ordenes_compra_venta / facturacion aún no tienen datos.
// La vista queda lista para conectar cuando se carguen.
</script>

<template>
    <div class="flex flex-col gap-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-surface-950 dark:text-surface-0">
                    Compras & Proveedores
                </h2>
                <p class="text-sm text-surface-500 dark:text-white/60 mt-0.5">
                    Órdenes de compra · Proveedores · Costos
                </p>
            </div>
            <i class="pi pi-shopping-bag text-3xl text-blue-400 dark:text-blue-500" />
        </div>

        <!-- Sin datos -->
        <div class="card flex flex-col items-center justify-center gap-4 py-16 border border-dashed border-blue-200 dark:border-blue-800/50">
            <div class="w-16 h-16 rounded-2xl bg-blue-100/40 dark:bg-blue-900/20 flex items-center justify-center">
                <i class="pi pi-shopping-bag text-3xl text-blue-500 dark:text-blue-400" />
            </div>
            <div class="text-center">
                <p class="font-semibold text-surface-700 dark:text-surface-200 mb-1">
                    Sin datos de compras aún
                </p>
                <p class="text-sm text-surface-400 dark:text-white/40 max-w-sm">
                    Carga la colección <code class="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">ordenes_compra_venta</code> en andoraDB para activar este tablero.
                </p>
            </div>
        </div>

    </div>
</template>
