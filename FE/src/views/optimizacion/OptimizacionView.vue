<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const modulos = [
    {
        id: 'modelos-proceso',
        label: 'Modelos de Proceso',
        description: 'Modelos rigurosos de unidades de proceso: reactores, columnas, intercambiadores',
        icon: 'pi-sitemap',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        categoria: 'Modelado',
        route: '/optimizacion/modelos-proceso',
        disponible: false,
    },
    {
        id: 'optimizacion-mezclas',
        label: 'Optimización de Mezclas',
        description: 'Blend optimization para maximizar margen en productos de mezcla (LP/QP)',
        icon: 'pi-sliders-h',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        categoria: 'Optimización',
        route: '/optimizacion/mezclas',
        disponible: false,
    },
    {
        id: 'what-if',
        label: 'Análisis What-If',
        description: 'Evaluación de escenarios alternativos de operación y sus impactos económicos',
        icon: 'pi-objects-column',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        categoria: 'Simulación',
        route: '/optimizacion/what-if',
        disponible: false,
    },
    {
        id: 'lp-planning',
        label: 'LP de Planeación',
        description: 'Programación lineal para maximizar margen de contribución mensual',
        icon: 'pi-chart-bar',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        categoria: 'Optimización',
        route: '/optimizacion/lp-planning',
        disponible: false,
    },
    {
        id: 'optimizacion-rutas',
        label: 'Optimización de Rutas',
        description: 'Selección óptima de rutas de transporte minimizando costo logístico total',
        icon: 'pi-directions',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        categoria: 'Optimización',
        route: '/optimizacion/rutas',
        disponible: false,
    },
    {
        id: 'simulacion-monte-carlo',
        label: 'Simulación Monte Carlo',
        description: 'Análisis de riesgo e incertidumbre en proyecciones de producción y margen',
        icon: 'pi-chart-scatter',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        categoria: 'Simulación',
        route: '/optimizacion/monte-carlo',
        disponible: false,
    },
    {
        id: 'benchmarking',
        label: 'Benchmarking',
        description: 'Comparación de KPIs operativos contra mejores prácticas de la industria',
        icon: 'pi-gauge',
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        categoria: 'Análisis',
        route: '/optimizacion/benchmarking',
        disponible: false,
    },
    {
        id: 'energia',
        label: 'Optimización Energética',
        description: 'Minimización de consumo de vapor, combustible y electricidad por unidad de producto',
        icon: 'pi-bolt',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        categoria: 'Optimización',
        route: '/optimizacion/energia',
        disponible: false,
    },
    {
        id: 'digital-twin',
        label: 'Gemelo Digital',
        description: 'Modelo dinámico sincronizado con datos de proceso en tiempo real',
        icon: 'pi-sync',
        color: 'text-pink-600',
        bg: 'bg-pink-50',
        border: 'border-pink-200',
        categoria: 'Modelado',
        route: '/optimizacion/digital-twin',
        disponible: false,
    },
];

const categorias = [...new Set(modulos.map(m => m.categoria))];

const categoriaMeta = {
    Modelado:     { icon: 'pi-sitemap',    color: 'text-blue-600',  bg: 'bg-blue-100'  },
    Optimización: { icon: 'pi-sliders-h',  color: 'text-green-600', bg: 'bg-green-100' },
    Simulación:   { icon: 'pi-chart-line', color: 'text-purple-600',bg: 'bg-purple-100'},
    Análisis:     { icon: 'pi-chart-bar',  color: 'text-cyan-600',  bg: 'bg-cyan-100'  },
};
</script>

<template>
    <div>
        <!-- Encabezado -->
        <div class="flex align-items-center gap-3 mb-4">
            <div class="flex align-items-center justify-content-center w-3rem h-3rem border-round-lg bg-indigo-100">
                <i class="pi pi-sliders-h text-indigo-600 text-xl" />
            </div>
            <div>
                <h2 class="text-2xl font-bold m-0">Optimización de Operaciones y Modelado</h2>
                <p class="text-color-secondary text-sm mt-1 m-0">
                    Modelos de proceso, programación matemática y análisis de escenarios
                </p>
            </div>
            <Tag value="En desarrollo" severity="warn" class="ml-auto" style="font-size:0.7rem" />
        </div>

        <!-- Secciones por categoría -->
        <div v-for="cat in categorias" :key="cat" class="mb-5">

            <!-- Cabecera de categoría -->
            <div class="flex align-items-center gap-2 mb-3">
                <div :class="`flex align-items-center justify-content-center w-2rem h-2rem border-round ${categoriaMeta[cat].bg}`">
                    <i :class="`pi ${categoriaMeta[cat].icon} text-sm ${categoriaMeta[cat].color}`" />
                </div>
                <span class="font-bold text-base">{{ cat }}</span>
                <Divider class="flex-1 ml-2" />
            </div>

            <!-- Tarjetas de la categoría -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div
                    v-for="m in modulos.filter(x => x.categoria === cat)"
                    :key="m.id"
                    class="card border-1 relative overflow-hidden flex flex-column gap-3"
                    :class="[m.border, m.disponible ? 'cursor-pointer hover:shadow-md transition-shadow' : 'opacity-70']"
                    @click="m.disponible && router.push(m.route)"
                >
                    <!-- Badge -->
                    <div v-if="!m.disponible"
                         class="absolute top-0 right-0 px-2 py-1"
                         style="background:rgba(0,0,0,0.06); font-size:0.6rem; border-radius:0 0 0 6px; color:#64748b; letter-spacing:0.05em; font-weight:600">
                        PRÓXIMAMENTE
                    </div>

                    <div class="flex align-items-center gap-3">
                        <div :class="`flex align-items-center justify-content-center w-2rem h-2rem border-round-lg ${m.bg}`">
                            <i :class="`pi ${m.icon} text-sm ${m.color}`" />
                        </div>
                        <span class="font-semibold text-sm">{{ m.label }}</span>
                    </div>

                    <p class="text-xs text-color-secondary m-0 line-height-3">{{ m.description }}</p>

                    <div class="flex align-items-center gap-2">
                        <Tag :value="m.categoria" severity="secondary" style="font-size:0.6rem" />
                        <span v-if="m.disponible" :class="`text-xs flex align-items-center gap-1 ml-auto ${m.color}`">
                            <i class="pi pi-arrow-right text-xs" /> Abrir
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
