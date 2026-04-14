<script setup>
import CatalogCrud from '@/components/admin/CatalogCrud.vue';

const fields = [
    { key: 'numEmpleado',  label: 'Núm. Empleado', type: 'text',    required: true,  width: '9rem' },
    { key: 'nombre',       label: 'Nombre',        type: 'text',    required: true },
    { key: 'apellido',     label: 'Apellido',      type: 'text',    required: true },
    { key: 'puesto',       label: 'Puesto',        type: 'text' },
    { key: 'departamento', label: 'Departamento',  type: 'select',
      options: ['Producción', 'Calidad', 'Logística', 'Mantenimiento',
                'Administración', 'Compras', 'Ventas', 'Seguridad', 'RRHH'],
    },
    { key: 'plantaId',     label: 'Planta',        type: 'ref',     refEntity: 'plantas', refLabel: 'nombre', optionValue: 'id' },
    { key: 'sitioId',      label: 'Sitio',         type: 'ref',     refEntity: 'sitios',  refLabel: 'nombre', optionValue: 'id' },
    { key: 'email',        label: 'Email',         type: 'text' },
    { key: 'telefono',     label: 'Teléfono',      type: 'text' },
    { key: 'activo',       label: 'Activo',        type: 'boolean' },
];
</script>

<template>
    <CatalogCrud
        entity="trabajadores"
        title="Trabajadores"
        icon="pi-users"
        :fields="fields"
    />
</template>
