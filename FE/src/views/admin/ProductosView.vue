<script setup>
import CatalogCrud from '@/components/admin/CatalogCrud.vue';

const fields = [
    { key: 'clave',          label: 'Clave',            type: 'text',    required: true,  width: '8rem' },
    { key: 'nombre',         label: 'Nombre',           type: 'text',    required: true },
    { key: 'categoria',      label: 'Categoría',        type: 'select',
      options: ['Petroquímico', 'Fertilizante', 'Intermedio', 'Materia Prima',
                'Residuo', 'Químico Industrial', 'Gas', 'Lubricante', 'Otro'],
    },
    { key: 'unidad',         label: 'Unidad',           type: 'select',
      options: ['Ton', 'Kg', 'Lt', 'Bbl', 'Nm³', 'M³', 'Pza'],
    },
    { key: 'esProductoFinal', label: 'Producto Final', type: 'boolean' },
    { key: 'descripcion',    label: 'Descripción',      type: 'textarea' },
    { key: 'activo',         label: 'Activo',           type: 'boolean' },
];
</script>

<template>
    <CatalogCrud
        entity="productos"
        title="Productos"
        icon="pi-box"
        :fields="fields"
    />
</template>
