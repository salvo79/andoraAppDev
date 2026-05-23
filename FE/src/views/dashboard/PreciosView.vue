<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/service/api';

const loading = ref(true);
const error   = ref(null);
const precios = ref([]);

const categoriaFiltro = ref(null);
const categorias = ['Producto Final', 'Materia Prima', 'Corriente Interna', 'Servicio'];

async function loadPrecios() {
    loading.value = true;
    error.value   = null;
    try {
        const { data } = await api.get('/operations/precios');
        precios.value = data;
    } catch (err) {
        error.value = 'No se pudieron cargar los precios.';
    } finally {
        loading.value = false;
    }
}

const preciosFiltrados = computed(() => {
    if (!categoriaFiltro.value) return precios.value;
    return precios.value.filter(p => p.categoria === categoriaFiltro.value);
});

const margenColor = (pct) => {
    if (pct >= 15) return 'text-green-600 dark:text-green-400';
    if (pct >= 5)  return 'text-amber-600 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
};

const categoriaSeverity = (cat) => {
    const map = {
        'Producto Final':    'success',
        'Materia Prima':     'info',
        'Corriente Interna': 'secondary',
        'Servicio':          'warn'
    };
    return map[cat] ?? 'secondary';
};

onMounted(loadPrecios);
</script>

<template>
    <div class="flex flex-col gap-6">

        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
                <h2 class="text-xl font-bold text-surface-950 dark:text-surface-0">
                    Precios Reales
                </h2>
                <p class="text-sm text-surface-500 dark:text-white/60 mt-0.5">
                    Histórico de precios 2020–2025 · {{ precios.length }} registros
                </p>
            </div>
            <div class="flex items-center gap-3">
                <!-- Filtro categoría -->
                <Select
                    v-model="categoriaFiltro"
                    :options="categorias"
                    placeholder="Todas las categorías"
                    showClear
                    class="w-56"
                />
                <Button
                    icon="pi pi-refresh"
                    severity="secondary"
                    text
                    rounded
                    @click="loadPrecios"
                    v-tooltip.left="'Actualizar'"
                />
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="n in 6" :key="n" class="card animate-pulse h-28 bg-surface-100 dark:bg-surface-800" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="card flex items-center gap-3 text-red-500">
            <i class="pi pi-exclamation-circle text-lg" />
            {{ error }}
            <Button label="Reintentar" text size="small" @click="loadPrecios" />
        </div>

        <!-- Tabla de precios -->
        <div v-else class="card p-0 overflow-hidden">
            <DataTable
                :value="preciosFiltrados"
                paginator
                :rows="15"
                :rowsPerPageOptions="[15, 30, 50]"
                scrollable
                scrollHeight="550px"
                sortField="precioNetoMxn"
                :sortOrder="-1"
                stripedRows
                size="small"
                class="text-sm"
            >
                <Column field="nombre" header="Nombre" sortable style="min-width:220px" />
                <Column field="categoria" header="Categoría" sortable style="min-width:140px">
                    <template #body="{ data }">
                        <Tag :value="data.categoria" :severity="categoriaSeverity(data.categoria)" />
                    </template>
                </Column>
                <Column field="anio" header="Año" sortable style="width:70px" />
                <Column field="mes" header="Mes" sortable style="width:60px" />
                <Column field="precioNetoMxn" header="Precio Neto" sortable style="min-width:120px">
                    <template #body="{ data }">
                        {{ data.precioNetoMxn.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }) }}
                    </template>
                </Column>
                <Column field="costoMxn" header="Costo" sortable style="min-width:110px">
                    <template #body="{ data }">
                        {{ data.costoMxn.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }) }}
                    </template>
                </Column>
                <Column field="margenPct" header="Margen %" sortable style="width:100px">
                    <template #body="{ data }">
                        <span :class="margenColor(data.margenPct * 100)">
                            {{ (data.margenPct * 100).toFixed(1) }}%
                        </span>
                    </template>
                </Column>
                <Column field="indiceBase100" header="Índice" sortable style="width:90px">
                    <template #body="{ data }">
                        {{ data.indiceBase100.toFixed(1) }}
                    </template>
                </Column>
            </DataTable>
        </div>

    </div>
</template>

