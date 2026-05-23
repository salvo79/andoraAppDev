<script setup>
import catalogService from '@/service/catalogService';
import { FilterMatchMode } from '@primevue/core/api';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';

/* ──────────────────────────────────────────────────────────────
   Props
   ──────────────────────────────────────────────────────────── */
const props = defineProps({
    /** Clave de la entidad: 'sitios', 'plantas', etc. */
    entity: { type: String, required: true },
    /** Título que se muestra en la cabecera */
    title: { type: String, required: true },
    /** Icono PrimeIcons para la cabecera */
    icon: { type: String, default: 'pi-database' },
    /**
     * Definición de columnas/campos.
     * Cada campo: { key, label, type, required, width, options, optionLabel, optionValue, refEntity, refLabel, refStore }
     * type: 'text' | 'number' | 'boolean' | 'select' | 'ref' | 'date' | 'textarea'
     */
    fields: { type: Array, required: true },
    /** Valores por defecto para el diálogo de nuevo registro */
    defaults: { type: Object, default: () => ({}) },
});

/* ──────────────────────────────────────────────────────────────
   State
   ──────────────────────────────────────────────────────────── */
const toast   = useToast();
const confirm = useConfirm();

const items      = ref([]);
const item       = ref({});
const loading    = ref(false);
const showDialog = ref(false);
const isEditing  = ref(false);
const submitted  = ref(false);
const dt         = ref();

const filters = ref({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });

// Cache de opciones para campos 'ref'
const refCache = ref({});

/* ──────────────────────────────────────────────────────────────
   Cargar datos
   ──────────────────────────────────────────────────────────── */
async function load() {
    loading.value = true;
    try {
        items.value = await catalogService.getAll(props.entity);
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 });
    } finally {
        loading.value = false;
    }
}

// Carga opciones para campos de tipo 'ref'
async function loadRefOptions() {
    for (const field of props.fields) {
        if (field.type === 'ref' && field.refEntity && !refCache.value[field.refEntity]) {
            try {
                refCache.value[field.refEntity] = await catalogService.getAll(field.refEntity);
            } catch {
                refCache.value[field.refEntity] = [];
            }
        }
    }
}

onMounted(async () => {
    await load();
    await loadRefOptions();
});

watch(() => props.entity, async () => {
    await load();
    await loadRefOptions();
});

/* ──────────────────────────────────────────────────────────────
   Helpers de visualización
   ──────────────────────────────────────────────────────────── */
function displayValue(field, row) {
    const val = row[field.key];
    if (val === null || val === undefined) return '—';

    if (field.type === 'boolean') return val ? 'Sí' : 'No';

    if (field.type === 'ref') {
        const opts = refCache.value[field.refEntity] || [];
        const found = opts.find(o => o[field.optionValue || 'id'] === val);
        return found ? found[field.refLabel || 'nombre'] : val;
    }

    if (field.type === 'select' && field.options) {
        const found = field.options.find(o =>
            (typeof o === 'string' ? o : o[field.optionValue || 'value']) === val
        );
        return found ? (typeof found === 'string' ? found : found[field.optionLabel || 'label']) : val;
    }

    if (field.type === 'date' && val) {
        return new Date(val).toLocaleDateString('es-MX');
    }

    if (field.type === 'number') {
        return val?.toLocaleString('es-MX') ?? '—';
    }

    return val;
}

function getRefOptions(field) {
    return (refCache.value[field.refEntity] || []).filter(o => o.activo !== false);
}

/* ──────────────────────────────────────────────────────────────
   CRUD actions
   ──────────────────────────────────────────────────────────── */
function openNew() {
    item.value = { activo: true, ...props.defaults };
    isEditing.value = false;
    submitted.value = false;
    showDialog.value = true;
}

function editItem(row) {
    item.value = { ...row };
    isEditing.value = true;
    submitted.value = false;
    showDialog.value = true;
}

function closeDialog() {
    showDialog.value = false;
    submitted.value = false;
}

function validate() {
    for (const f of props.fields) {
        if (f.required && !item.value[f.key]) return false;
    }
    return true;
}

async function saveItem() {
    submitted.value = true;
    if (!validate()) return;

    try {
        if (isEditing.value) {
            const updated = await catalogService.update(props.entity, item.value.id, item.value);
            const idx = items.value.findIndex(i => i.id === updated.id);
            if (idx !== -1) items.value[idx] = updated;
            toast.add({ severity: 'success', summary: 'Guardado', detail: 'Registro actualizado', life: 3000 });
        } else {
            const created = await catalogService.create(props.entity, item.value);
            items.value.push(created);
            toast.add({ severity: 'success', summary: 'Creado', detail: 'Registro creado', life: 3000 });
        }
        closeDialog();
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el registro', life: 3000 });
    }
}

function confirmDelete(row) {
    confirm.require({
        message: `¿Eliminar "${row.nombre || row.numEmpleado || row.clave || row.id}"?`,
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'Cancelar',
        acceptClass: 'p-button-danger',
        accept: () => deleteItem(row),
    });
}

async function deleteItem(row) {
    try {
        await catalogService.remove(props.entity, row.id);
        items.value = items.value.filter(i => i.id !== row.id);
        toast.add({ severity: 'warn', summary: 'Eliminado', detail: 'Registro eliminado', life: 3000 });
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el registro', life: 3000 });
    }
}

// Columnas visibles en la tabla (max 5 primeras)
const tableFields = props.fields.filter(f => f.type !== 'textarea').slice(0, 5);
</script>

<template>
    <div class="card">
        <!-- Cabecera ─────────────────────────────────────────── -->
        <div class="flex align-items-center justify-content-between mb-4">
            <div class="flex align-items-center gap-2">
                <i :class="`pi ${icon} text-2xl text-primary`" />
                <span class="text-xl font-semibold">{{ title }}</span>
                <Badge :value="items.length" severity="secondary" />
            </div>
            <Button label="Nuevo" icon="pi pi-plus" @click="openNew" />
        </div>

        <!-- Buscador ─────────────────────────────────────────── -->
        <div class="mb-3">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" />
            </IconField>
        </div>

        <!-- Tabla ───────────────────────────────────────────── -->
        <DataTable
            ref="dt"
            :value="items"
            :loading="loading"
            :filters="filters"
            filterDisplay="menu"
            paginator
            :rows="15"
            :rowsPerPageOptions="[10, 15, 25, 50]"
            removableSort
            stripedRows
            tableStyle="min-width: 50rem"
            currentPageReportTemplate="{first}-{last} de {totalRecords}"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        >
            <!-- Columnas dinámicas -->
            <Column
                v-for="f in tableFields"
                :key="f.key"
                :field="f.key"
                :header="f.label"
                :sortable="f.type !== 'boolean'"
                :style="f.width ? `width: ${f.width}` : ''"
            >
                <template #body="{ data }">
                    <Tag
                        v-if="f.type === 'boolean'"
                        :value="data[f.key] ? 'Activo' : 'Inactivo'"
                        :severity="data[f.key] ? 'success' : 'danger'"
                    />
                    <span v-else>{{ displayValue(f, data) }}</span>
                </template>
            </Column>

            <!-- Acciones -->
            <Column header="Acciones" style="width: 8rem; text-align: center">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" text rounded class="mr-1" @click="editItem(data)" />
                    <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data)" />
                </template>
            </Column>

            <template #empty>
                <div class="text-center text-color-secondary py-4">Sin registros</div>
            </template>
        </DataTable>

        <!-- Diálogo crear / editar ───────────────────────────── -->
        <Dialog
            v-model:visible="showDialog"
            :header="isEditing ? `Editar ${title}` : `Nuevo ${title}`"
            modal
            :style="{ width: '520px' }"
            :closable="true"
            @hide="closeDialog"
        >
            <div class="grid grid-cols-1 gap-4 mt-2">
                <template v-for="f in fields" :key="f.key">
                    <div class="flex flex-column gap-1">
                        <label :for="f.key" class="font-medium text-sm">
                            {{ f.label }}<span v-if="f.required" class="text-red-500 ml-1">*</span>
                        </label>

                        <!-- Texto -->
                        <InputText
                            v-if="f.type === 'text' || !f.type"
                            :id="f.key"
                            v-model="item[f.key]"
                            :class="{ 'p-invalid': submitted && f.required && !item[f.key] }"
                            :placeholder="f.placeholder || f.label"
                        />

                        <!-- Número -->
                        <InputNumber
                            v-else-if="f.type === 'number'"
                            :id="f.key"
                            v-model="item[f.key]"
                            :minFractionDigits="f.decimals ?? 0"
                            :maxFractionDigits="f.decimals ?? 2"
                            :class="{ 'p-invalid': submitted && f.required && item[f.key] == null }"
                        />

                        <!-- Área de texto -->
                        <Textarea
                            v-else-if="f.type === 'textarea'"
                            :id="f.key"
                            v-model="item[f.key]"
                            rows="3"
                            :placeholder="f.placeholder || f.label"
                        />

                        <!-- Select estático -->
                        <Select
                            v-else-if="f.type === 'select'"
                            :id="f.key"
                            v-model="item[f.key]"
                            :options="f.options"
                            :optionLabel="f.optionLabel || 'label'"
                            :optionValue="f.optionValue || 'value'"
                            :placeholder="`Seleccionar ${f.label}`"
                            :class="{ 'p-invalid': submitted && f.required && !item[f.key] }"
                            class="w-full"
                        />

                        <!-- Select referencia a otra entidad -->
                        <Select
                            v-else-if="f.type === 'ref'"
                            :id="f.key"
                            v-model="item[f.key]"
                            :options="getRefOptions(f)"
                            :optionLabel="f.refLabel || 'nombre'"
                            :optionValue="f.optionValue || 'id'"
                            :placeholder="`Seleccionar ${f.label}`"
                            :class="{ 'p-invalid': submitted && f.required && !item[f.key] }"
                            class="w-full"
                            filter
                        />

                        <!-- Fecha -->
                        <DatePicker
                            v-else-if="f.type === 'date'"
                            :id="f.key"
                            v-model="item[f.key]"
                            dateFormat="dd/mm/yy"
                            :placeholder="`dd/mm/aaaa`"
                            class="w-full"
                        />

                        <!-- Boolean -->
                        <div v-else-if="f.type === 'boolean'" class="flex align-items-center gap-2 mt-1">
                            <ToggleSwitch :id="f.key" v-model="item[f.key]" />
                            <label :for="f.key">{{ item[f.key] ? 'Activo' : 'Inactivo' }}</label>
                        </div>

                        <small v-if="submitted && f.required && !item[f.key]" class="text-red-500">
                            {{ f.label }} es obligatorio.
                        </small>
                    </div>
                </template>

                <!-- Campo activo siempre presente si no está en fields -->
                <div v-if="!fields.find(f => f.key === 'activo')" class="flex align-items-center gap-2">
                    <ToggleSwitch id="activo" v-model="item.activo" />
                    <label for="activo">Activo</label>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="closeDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveItem" />
            </template>
        </Dialog>

        <ConfirmDialog />
    </div>
</template>
