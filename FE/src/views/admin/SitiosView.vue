<script setup>
import CatalogCrud from '@/components/admin/CatalogCrud.vue';

const fields = [
    { key: 'clave',       label: 'Clave',       type: 'text',    required: true,  width: '8rem' },
    { key: 'nombre',      label: 'Nombre',      type: 'text',    required: true },
    { key: 'ubicacion',   label: 'Ubicación',   type: 'text' },
    { key: 'estado',      label: 'Estado',      type: 'select',
      options: ['Aguascalientes','Baja California','Campeche','Chiapas','Chihuahua',
                'Ciudad de México','Coahuila','Colima','Durango','Guanajuato','Guerrero',
                'Hidalgo','Jalisco','México','Michoacán','Morelos','Nayarit','Nuevo León',
                'Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí','Sinaloa',
                'Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas'],
    },
    { key: 'descripcion', label: 'Descripción', type: 'textarea' },
    { key: 'activo',      label: 'Activo',      type: 'boolean' },
];
</script>

<template>
    <CatalogCrud
        entity="sitios"
        title="Sitios"
        icon="pi-map-marker"
        :fields="fields"
    />
</template>
