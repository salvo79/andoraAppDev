<script setup>
import CatalogCrud from '@/components/admin/CatalogCrud.vue';

const fields = [
    { key: 'clave',        label: 'Clave',          type: 'text',    required: true,  width: '8rem' },
    { key: 'nombre',       label: 'Nombre',         type: 'text',    required: true },
    { key: 'tipoServicio', label: 'Tipo Servicio',  type: 'select',
      options: ['Transporte', 'Insumos', 'Servicios', 'Maquila', 'Laboratorio', 'Mantenimiento', 'Otro'],
    },
    { key: 'contacto',     label: 'Contacto',       type: 'text' },
    { key: 'email',        label: 'Email',          type: 'text' },
    { key: 'telefono',     label: 'Teléfono',       type: 'text' },
    { key: 'rfc',          label: 'RFC',            type: 'text' },
    { key: 'direccion',    label: 'Dirección',      type: 'textarea' },
    { key: 'activo',       label: 'Activo',         type: 'boolean' },
];
</script>

<template>
    <CatalogCrud
        entity="proveedores"
        title="Proveedores"
        icon="pi-truck"
        :fields="fields"
    />
</template>
