<script setup>
import { ref } from 'vue';
import SectionCard from '@/components/ui/SectionCard.vue';

const emit = defineEmits(['open-module']);

const modules = ref([
    {
        key: 'compras',
        label: 'Compras',
        icon: 'pi pi-shopping-bag',
        kpi: '$4.2M',
        kpiLabel: 'mes actual',
        status: 'ok',
        statusLabel: 'Normal',
        detail: '18 OCs • 6 prov. activos',
        color: 'blue'
    },
    {
        key: 'produccion',
        label: 'Producción',
        icon: 'pi pi-cog',
        kpi: '78.4%',
        kpiLabel: 'OEE global',
        status: 'warn',
        statusLabel: 'Atención',
        detail: '5 plantas • 2 alertas',
        color: 'indigo'
    },
    {
        key: 'calidad',
        label: 'Calidad',
        icon: 'pi pi-verified',
        kpi: '96.2%',
        kpiLabel: 'índice calidad',
        status: 'ok',
        statusLabel: 'Conforme',
        detail: '3 NC abiertas',
        color: 'teal'
    },
    {
        key: 'inventario',
        label: 'Inventarios',
        icon: 'pi pi-box',
        kpi: '14 días',
        kpiLabel: 'cobertura',
        status: 'warn',
        statusLabel: 'Bajo mínimo',
        detail: '2 corrientes críticas',
        color: 'amber'
    },
    {
        key: 'logistica',
        label: 'Logística',
        icon: 'pi pi-truck',
        kpi: '91.7%',
        kpiLabel: 'on-time delivery',
        status: 'ok',
        statusLabel: 'Operando',
        detail: '142 mov. hoy',
        color: 'cyan'
    },
    {
        key: 'ventas',
        label: 'Ventas',
        icon: 'pi pi-chart-line',
        kpi: '$6.8M',
        kpiLabel: 'mes actual',
        status: 'ok',
        statusLabel: '87% objetivo',
        detail: '12 vendedores activos',
        color: 'green'
    }
]);

const statusConfig = {
    ok:   { dot: 'bg-green-500', tag: 'success' },
    warn: { dot: 'bg-amber-400', tag: 'warn' },
    err:  { dot: 'bg-red-500',   tag: 'danger' }
};

const colorBorder = {
    blue:   'border-blue-200 dark:border-blue-800/50',
    indigo: 'border-indigo-200 dark:border-indigo-800/50',
    teal:   'border-teal-200 dark:border-teal-800/50',
    amber:  'border-amber-200 dark:border-amber-800/50',
    cyan:   'border-cyan-200 dark:border-cyan-800/50',
    green:  'border-green-200 dark:border-green-800/50'
};

const colorIcon = {
    blue:   'text-blue-600 dark:text-blue-400 bg-blue-100/40 dark:bg-blue-900/20',
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100/40 dark:bg-indigo-900/20',
    teal:   'text-teal-600 dark:text-teal-400 bg-teal-100/40 dark:bg-teal-900/20',
    amber:  'text-amber-600 dark:text-amber-400 bg-amber-100/40 dark:bg-amber-900/20',
    cyan:   'text-cyan-600 dark:text-cyan-400 bg-cyan-100/40 dark:bg-cyan-900/20',
    green:  'text-green-600 dark:text-green-400 bg-green-100/40 dark:bg-green-900/20'
};
</script>

<template>
    <SectionCard>
        <template #title>Cadena de Valor — Vista Operativa</template>
        <template #description>Selecciona un módulo para ver el detalle completo con KPIs, gráficas y tablas.</template>

        <!-- Flow chain -->
        <div class="flex flex-col xl:flex-row items-stretch gap-0 mt-4 overflow-x-auto pb-2">
            <template v-for="(mod, idx) in modules" :key="mod.key">

                <!-- Module card -->
                <div
                    class="relative flex-1 min-w-[160px] border rounded-2xl p-4 cursor-pointer
                           hover:shadow-md transition-all duration-200 hover:-translate-y-0.5
                           bg-surface-0 dark:bg-surface-900"
                    :class="colorBorder[mod.color]"
                    @click="emit('open-module', mod.key)"
                >
                    <!-- Animated pulse dot -->
                    <span
                        class="absolute top-3 right-3 w-2 h-2 rounded-full"
                        :class="statusConfig[mod.status].dot"
                    >
                        <span
                            class="absolute inset-0 rounded-full animate-ping opacity-60"
                            :class="statusConfig[mod.status].dot"
                        />
                    </span>

                    <!-- Icon -->
                    <div
                        class="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        :class="colorIcon[mod.color]"
                    >
                        <i :class="[mod.icon, 'text-lg']" />
                    </div>

                    <!-- Label -->
                    <p class="font-semibold text-sm text-surface-950 dark:text-surface-0 mb-1">
                        {{ mod.label }}
                    </p>

                    <!-- Main KPI -->
                    <p class="text-xl font-bold text-surface-950 dark:text-surface-0 leading-tight">
                        {{ mod.kpi }}
                    </p>
                    <p class="text-xs text-surface-400 dark:text-white/40 mb-2">
                        {{ mod.kpiLabel }}
                    </p>

                    <!-- Status badge -->
                    <Tag :severity="statusConfig[mod.status].tag" class="text-xs mb-2">
                        {{ mod.statusLabel }}
                    </Tag>

                    <!-- Detail line -->
                    <p class="text-xs text-surface-500 dark:text-white/50">
                        {{ mod.detail }}
                    </p>
                </div>

                <!-- Arrow connector (not after last item) -->
                <div
                    v-if="idx < modules.length - 1"
                    class="hidden xl:flex items-center justify-center w-8 shrink-0
                           text-surface-300 dark:text-white/20 text-xl"
                >
                    <i class="pi pi-angle-right" />
                </div>

            </template>
        </div>

        <template #footer>
            <div class="flex items-center gap-4 text-xs text-surface-400 dark:text-white/40">
                <span class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    Operando normal
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    Requiere atención
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    Crítico
                </span>
                <span class="ml-auto italic">Datos al: {{ new Date().toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }) }}</span>
            </div>
        </template>
    </SectionCard>
</template>
