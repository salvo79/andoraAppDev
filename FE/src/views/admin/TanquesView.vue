<script setup>
import CatalogCrud from '@/components/admin/CatalogCrud.vue';

const fields = [
    { key: 'clave',        label: 'Clave',           type: 'text',   required: true,  width: '8rem' },
    { key: 'nombre',       label: 'Nombre',          type: 'text',   required: true },
    { key: 'plantaId',     label: 'Planta',          type: 'ref',    refEntity: 'plantas', refLabel: 'nombre', optionValue: 'id' },
    { key: 'tipoProducto', label: 'Tipo Producto',   type: 'select',
      options: ['Crudo', 'Intermedio', 'Final', 'Residuo', 'Agua', 'Químico'],
    },
    { key: 'capacidadM3',  label: 'Capacidad (m³)',  type: 'number', decimals: 2 },
    { key: 'material',     label: 'Material',        type: 'select',
      options: ['Acero carbón', 'Acero inoxidable', 'Polietileno', 'Fibra de vidrio', 'Concreto'],
    },
    { key: 'activo',       label: 'Activo',          type: 'boolean' },
];
</script>

<template>
    <CatalogCrud
        entity="tanques"
        title="Tanques"
        icon="pi-database"
        :fields="fields"
    />
</template>
