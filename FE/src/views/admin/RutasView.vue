<script setup>
import CatalogCrud from '@/components/admin/CatalogCrud.vue';

const fields = [
    { key: 'clave',          label: 'Clave',            type: 'text',   required: true,  width: '8rem' },
    { key: 'nombre',         label: 'Nombre',           type: 'text',   required: true },
    { key: 'origen',         label: 'Origen',           type: 'text' },
    { key: 'destino',        label: 'Destino',          type: 'text' },
    { key: 'distanciaKm',    label: 'Distancia (km)',   type: 'number', decimals: 1 },
    { key: 'tipoTransporte', label: 'Tipo Transporte',  type: 'select',
      options: ['Pipa', 'Camión', 'Ferrocarril', 'Ducto', 'Barco', 'Otro'],
    },
    { key: 'proveedorId',    label: 'Proveedor',        type: 'ref',    refEntity: 'proveedores', refLabel: 'nombre', optionValue: 'id' },
    { key: 'activo',         label: 'Activo',           type: 'boolean' },
];
</script>

<template>
    <CatalogCrud
        entity="rutas"
        title="Rutas"
        icon="pi-directions"
        :fields="fields"
    />
</template>
