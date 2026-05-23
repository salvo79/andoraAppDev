<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const catalogos = [
    {
        entity: 'sitios',
        label: 'Sitios',
        description: 'Ubicaciones geográficas de operación',
        icon: 'pi-map-marker',
        color: 'bg-blue-100 text-blue-700',
        route: '/admin/sitios'
    },
    {
        entity: 'plantas',
        label: 'Plantas',
        description: 'Unidades de producción y mezcla',
        icon: 'pi-building',
        color: 'bg-green-100 text-green-700',
        route: '/admin/plantas'
    },
    {
        entity: 'trabajadores',
        label: 'Trabajadores',
        description: 'Personal operativo y administrativo',
        icon: 'pi-users',
        color: 'bg-purple-100 text-purple-700',
        route: '/admin/trabajadores'
    },
    {
        entity: 'proveedores',
        label: 'Proveedores',
        description: 'Empresas y servicios externos',
        icon: 'pi-truck',
        color: 'bg-orange-100 text-orange-700',
        route: '/admin/proveedores'
    },
    {
        entity: 'tanques',
        label: 'Tanques',
        description: 'Recipientes de almacenamiento',
        icon: 'pi-database',
        color: 'bg-cyan-100 text-cyan-700',
        route: '/admin/tanques'
    },
    {
        entity: 'rutas',
        label: 'Rutas',
        description: 'Trayectos de transporte y distribución',
        icon: 'pi-directions',
        color: 'bg-teal-100 text-teal-700',
        route: '/admin/rutas'
    },
    {
        entity: 'productos',
        label: 'Productos',
        description: 'Catálogo de materias primas y productos terminados',
        icon: 'pi-box',
        color: 'bg-yellow-100 text-yellow-700',
        route: '/admin/productos'
    },
    {
        entity: 'corrientes',
        label: 'Corrientes',
        description: 'Flujos de proceso entre unidades',
        icon: 'pi-arrow-right-arrow-left',
        color: 'bg-pink-100 text-pink-700',
        route: '/admin/corrientes'
    },
    {
        entity: 'precios',
        label: 'Precios',
        description: 'Catálogo de precios y tarifas vigentes',
        icon: 'pi-tag',
        color: 'bg-indigo-100 text-indigo-700',
        route: '/admin/precios'
    },
];
</script>

<template>
    <div>
        <!-- Encabezado -->
        <div class="mb-5">
            <h2 class="text-2xl font-bold m-0">Administración de Catálogos</h2>
            <p class="text-color-secondary mt-1">Gestiona los datos maestros del sistema</p>
        </div>

        <!-- Tarjetas de catálogos -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                v-for="cat in catalogos"
                :key="cat.entity"
                class="card cursor-pointer hover:shadow-lg transition-shadow duration-200 border-1 border-transparent hover:border-primary"
                @click="router.push(cat.route)"
            >
                <div class="flex align-items-center gap-3">
                    <div :class="`w-3rem h-3rem flex align-items-center justify-content-center border-round-lg ${cat.color}`">
                        <i :class="`pi ${cat.icon} text-xl`" />
                    </div>
                    <div class="flex-1">
                        <div class="font-semibold text-lg">{{ cat.label }}</div>
                        <div class="text-sm text-color-secondary">{{ cat.description }}</div>
                    </div>
                    <i class="pi pi-chevron-right text-color-secondary" />
                </div>
            </div>
        </div>
    </div>
</template>
