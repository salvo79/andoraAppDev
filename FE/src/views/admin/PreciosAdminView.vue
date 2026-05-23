<script setup>
import CatalogCrud from '@/components/admin/CatalogCrud.vue';

const fields = [
    { key: 'nombre',       label: 'Nombre',          type: 'text',   required: true },
    { key: 'categoria',    label: 'Categoría',       type: 'select',
      options: ['Venta', 'Compra', 'Referencia', 'Tarifa', 'Spot'],
    },
    { key: 'productoId',   label: 'Producto',        type: 'ref',    refEntity: 'productos', refLabel: 'nombre', optionValue: 'id' },
    { key: 'unidad',       label: 'Unidad',          type: 'select',
      options: ['Ton', 'Kg', 'Lt', 'Bbl', 'Nm³', 'M³'],
    },
    { key: 'precioNetoMxn', label: 'Precio Neto MXN', type: 'number', required: true, decimals: 2 },
    { key: 'costoMxn',     label: 'Costo MXN',       type: 'number', decimals: 2 },
    { key: 'margenPct',    label: 'Margen %',        type: 'number', decimals: 2 },
    { key: 'vigenciaDesde', label: 'Vigencia desde', type: 'date' },
    { key: 'vigenciaHasta', label: 'Vigencia hasta', type: 'date' },
    { key: 'activo',       label: 'Activo',          type: 'boolean' },
];
</script>

<template>
    <CatalogCrud
        entity="precios"
        title="Precios"
        icon="pi-tag"
        :fields="fields"
    />
</template>
