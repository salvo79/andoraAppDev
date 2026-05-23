<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const modulos = [
    {
        id: 'plan-produccion',
        label: 'Plan de Producción',
        description: 'Programación de volúmenes y productos por planta y período',
        icon: 'pi-calendar-plus',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        route: '/programacion/plan-produccion',
        disponible: false,
    },
    {
        id: 'ordenes-trabajo',
        label: 'Órdenes de Trabajo',
        description: 'Gestión y seguimiento de órdenes operativas y de mantenimiento',
        icon: 'pi-file-edit',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        route: '/programacion/ordenes-trabajo',
        disponible: false,
    },
    {
        id: 'turnos',
        label: 'Programa de Turnos',
        description: 'Asignación de personal por turno, planta y área operativa',
        icon: 'pi-users',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        route: '/programacion/turnos',
        disponible: false,
    },
    {
        id: 'mantenimiento',
        label: 'Programa de Mantenimiento',
        description: 'Planificación de mantenimiento preventivo y correctivo',
        icon: 'pi-wrench',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        route: '/programacion/mantenimiento',
        disponible: false,
    },
    {
        id: 'despacho',
        label: 'Programa de Despacho',
        description: 'Calendario de embarques, pipas y entregas a clientes',
        icon: 'pi-truck',
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        route: '/programacion/despacho',
        disponible: false,
    },
    {
        id: 'balance-materiales',
        label: 'Balance de Materiales',
        description: 'Programación de entradas, procesamiento y salidas por corriente',
        icon: 'pi-arrows-h',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        route: '/programacion/balance',
        disponible: false,
    },
    {
        id: 'compras-insumos',
        label: 'Compras de Insumos',
        description: 'Plan de abastecimiento de materias primas y químicos',
        icon: 'pi-shopping-bag',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        route: '/programacion/compras',
        disponible: false,
    },
    {
        id: 'paros-programados',
        label: 'Paros Programados',
        description: 'Gestión de paradas de planta: TAR, inspecciones y pruebas',
        icon: 'pi-pause-circle',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        route: '/programacion/paros',
        disponible: false,
    },
];

const kpis = [
    { label: 'Cumplimiento Plan',  value: '—',   unidad: '%',     icon: 'pi-check-circle',  color: 'text-green-500' },
    { label: 'OTs Abiertas',       value: '—',   unidad: 'órd.',  icon: 'pi-file-edit',     color: 'text-orange-500' },
    { label: 'Vol. Programado',    value: '—',   unidad: 'Ton',   icon: 'pi-database',      color: 'text-blue-500' },
    { label: 'Despachos Semana',   value: '—',   unidad: 'viajes',icon: 'pi-truck',         color: 'text-cyan-500' },
];
</script>

<template>
    <div>
        <!-- Encabezado -->
        <div class="flex align-items-center gap-3 mb-4">
            <div class="flex align-items-center justify-content-center w-3rem h-3rem border-round-lg bg-blue-100">
                <i class="pi pi-calendar text-blue-600 text-xl" />
            </div>
            <div>
                <h2 class="text-2xl font-bold m-0">Programación Operativa</h2>
                <p class="text-color-secondary text-sm mt-1 m-0">
                    Planeación, programación y seguimiento de la operación
                </p>
            </div>
            <Tag value="En desarrollo" severity="warn" class="ml-auto" style="font-size:0.7rem" />
        </div>

        <!-- KPIs rápidos -->
        <div class="grid grid-cols-4 gap-3 mb-4">
            <div v-for="k in kpis" :key="k.label"
                 class="card py-3 px-4 flex align-items-center gap-3">
                <i :class="`pi ${k.icon} text-2xl ${k.color}`" />
                <div>
                    <div class="text-2xl font-bold text-color-secondary">{{ k.value }}
                        <span class="text-sm font-normal">{{ k.unidad }}</span>
                    </div>
                    <div class="text-xs text-color-secondary">{{ k.label }}</div>
                </div>
            </div>
        </div>

        <!-- Módulos -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <div
                v-for="m in modulos"
                :key="m.id"
                class="card border-1 flex flex-column gap-3 relative overflow-hidden"
                :class="[m.border, m.disponible ? 'cursor-pointer hover:shadow-md transition-shadow' : 'opacity-70']"
                @click="m.disponible && router.push(m.route)"
            >
                <!-- Badge "Próximamente" -->
                <div v-if="!m.disponible"
                     class="absolute top-0 right-0 px-2 py-1 text-xs font-semibold"
                     style="background:rgba(0,0,0,0.06); font-size:0.6rem; border-radius:0 0 0 6px; color:#64748b; letter-spacing:0.05em">
                    PRÓXIMAMENTE
                </div>

                <div class="flex align-items-center gap-3">
                    <div :class="`flex align-items-center justify-content-center w-2rem h-2rem border-round-lg ${m.bg}`">
                        <i :class="`pi ${m.icon} text-sm ${m.color}`" />
                    </div>
                    <span class="font-semibold text-sm">{{ m.label }}</span>
                </div>
                <p class="text-xs text-color-secondary m-0">{{ m.description }}</p>

                <div v-if="m.disponible" class="flex align-items-center gap-1 text-xs" :class="m.color">
                    <i class="pi pi-arrow-right text-xs" /> Abrir módulo
                </div>
            </div>
        </div>
    </div>
</template>
