<script setup>
import CatalogCrud from '@/components/admin/CatalogCrud.vue';

const fields = [
    { key: 'clave',        label: 'Clave',          type: 'text',   required: true,  width: '8rem' },
    { key: 'nombre',       label: 'Nombre',         type: 'text',   required: true },
    { key: 'tipoCorriente', label: 'Tipo',          type: 'select',
      options: ['Entrada', 'Intermedia', 'Salida', 'Residuo', 'Recirculación'],
    },
    { key: 'productoId',   label: 'Producto',       type: 'ref',    refEntity: 'productos', refLabel: 'nombre', optionValue: 'id' },
    { key: 'unidad',       label: 'Unidad',         type: 'select',
      options: ['Ton', 'Kg', 'Lt', 'Bbl', 'Nm³', 'M³'],
    },
    { key: 'descripcion',  label: 'Descripción',    type: 'textarea' },
    { key: 'activo',       label: 'Activo',         type: 'boolean' },
];
</script>

<template>
    <CatalogCrud
        entity="corrientes"
        title="Corrientes"
        icon="pi-arrow-right-arrow-left"
        :fields="fields"
    />
</template>
