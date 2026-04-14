<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Dashboards',
        icon: 'pi pi-home',
        path: '/dashboard',
        items: [
            {
                label: 'Operaciones',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/dashboard/operations'
            },
            {
                label: 'DevExpress Dashboard',
                icon: 'pi pi-fw pi-objects-column',
                to: '/dashboard'
            }
        ]
    },
    { separator: true },
    {
        label: 'Seguimiento Operativo',
        icon: 'pi pi-wave-pulse',
        path: '/seguimiento',
        items: [
            {
                label: 'Historiador',
                icon: 'pi pi-fw pi-chart-line',
                to: '/seguimiento'
            }
        ]
    },
    { separator: true },
    {
        label: 'Programación Operativa',
        icon: 'pi pi-calendar',
        path: '/programacion',
        items: [
            {
                label: 'Resumen',
                icon: 'pi pi-fw pi-th-large',
                to: '/programacion'
            },
            {
                label: 'Plan de Producción',
                icon: 'pi pi-fw pi-calendar-plus',
                to: '/programacion/plan-produccion'
            },
            {
                label: 'Órdenes de Trabajo',
                icon: 'pi pi-fw pi-file-edit',
                to: '/programacion/ordenes-trabajo'
            },
            {
                label: 'Programa de Turnos',
                icon: 'pi pi-fw pi-users',
                to: '/programacion/turnos'
            },
            {
                label: 'Mantenimiento',
                icon: 'pi pi-fw pi-wrench',
                to: '/programacion/mantenimiento'
            },
            {
                label: 'Despacho',
                icon: 'pi pi-fw pi-truck',
                to: '/programacion/despacho'
            },
            {
                label: 'Balance de Materiales',
                icon: 'pi pi-fw pi-arrows-h',
                to: '/programacion/balance'
            }
        ]
    },
    { separator: true },
    {
        label: 'Optimización y Modelado',
        icon: 'pi pi-sliders-h',
        path: '/optimizacion',
        items: [
            {
                label: 'Resumen',
                icon: 'pi pi-fw pi-th-large',
                to: '/optimizacion'
            },
            {
                label: 'Modelos de Proceso',
                icon: 'pi pi-fw pi-sitemap',
                to: '/optimizacion/modelos-proceso'
            },
            {
                label: 'Optimización de Mezclas',
                icon: 'pi pi-fw pi-sliders-h',
                to: '/optimizacion/mezclas'
            },
            {
                label: 'LP de Planeación',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/optimizacion/lp-planning'
            },
            {
                label: 'Análisis What-If',
                icon: 'pi pi-fw pi-objects-column',
                to: '/optimizacion/what-if'
            },
            {
                label: 'Optimización de Rutas',
                icon: 'pi pi-fw pi-directions',
                to: '/optimizacion/rutas'
            },
            {
                label: 'Benchmarking',
                icon: 'pi pi-fw pi-gauge',
                to: '/optimizacion/benchmarking'
            },
            {
                label: 'Gemelo Digital',
                icon: 'pi pi-fw pi-sync',
                to: '/optimizacion/digital-twin'
            }
        ]
    },
    { separator: true },
    {
        label: 'Administración',
        icon: 'pi pi-cog',
        path: '/admin',
        items: [
            {
                label: 'Catálogos',
                icon: 'pi pi-fw pi-th-large',
                to: '/admin'
            },
            {
                label: 'Sitios',
                icon: 'pi pi-fw pi-map-marker',
                to: '/admin/sitios'
            },
            {
                label: 'Plantas',
                icon: 'pi pi-fw pi-building',
                to: '/admin/plantas'
            },
            {
                label: 'Trabajadores',
                icon: 'pi pi-fw pi-users',
                to: '/admin/trabajadores'
            },
            {
                label: 'Proveedores',
                icon: 'pi pi-fw pi-truck',
                to: '/admin/proveedores'
            },
            {
                label: 'Tanques',
                icon: 'pi pi-fw pi-database',
                to: '/admin/tanques'
            },
            {
                label: 'Rutas',
                icon: 'pi pi-fw pi-directions',
                to: '/admin/rutas'
            },
            {
                label: 'Productos',
                icon: 'pi pi-fw pi-box',
                to: '/admin/productos'
            },
            {
                label: 'Corrientes',
                icon: 'pi pi-fw pi-arrow-right-arrow-left',
                to: '/admin/corrientes'
            },
            {
                label: 'Precios',
                icon: 'pi pi-fw pi-tag',
                to: '/admin/precios'
            }
        ]
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, index) in model" :key="item.label + '_' + (item.to || item.path || index)">
            <AppMenuItem v-if="!item.separator" :item="item" :index="index" root />

            <li v-else class="menu-separator" />
        </template>
    </ul>
</template>
