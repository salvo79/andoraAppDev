<script setup>
import CatalogCrud from '@/components/admin/CatalogCrud.vue';

const fields = [
    { key: 'clave',        label: 'Clave',          type: 'text',    required: true,  width: '8rem' },
    { key: 'nombre',       label: 'Nombre',         type: 'text',    required: true },
    { key: 'sitioId',      label: 'Sitio',          type: 'ref',     refEntity: 'sitios', refLabel: 'nombre', optionValue: 'id' },
    { key: 'tipo',         label: 'Tipo',           type: 'select',
      options: [
          { label: 'Producción',  value: 'Producción'  },
          { label: 'Mezclado',    value: 'Mezclado'    },
          { label: 'Almacén',     value: 'Almacén'     },
          { label: 'Laboratorio', value: 'Laboratorio' },
      ],
      optionLabel: 'label', optionValue: 'value'
    },
    { key: 'capacidadTon', label: 'Capacidad (Ton)', type: 'number', decimals: 2 },
    { key: 'unidad',       label: 'Unidad',         type: 'select',
      options: ['Ton', 'Kg', 'Lt', 'Bbl', 'Nm³'],
    },
    { key: 'activo',       label: 'Activo',         type: 'boolean' },
];
</script>

<template>
    <CatalogCrud
        entity="plantas"
        title="Plantas"
        icon="pi-building"
        :fields="fields"
    />
</template>
