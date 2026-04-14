<script setup>
import { PROCESS_TREE } from '@/service/seguimientoService';
import { ref } from 'vue';

const emit = defineEmits(['add-tag']);

const nodes        = ref(PROCESS_TREE);
const expandedKeys = ref({ 'sitio-norte': true, 'planta-a': true });
const searchQuery  = ref('');

// ── Filtrado del árbol ────────────────────────────────────────────────────────
function filterNodes(nodes, q) {
    if (!q) return nodes;
    const lower = q.toLowerCase();
    return nodes.reduce((acc, node) => {
        if (node.label.toLowerCase().includes(lower)) {
            acc.push(node);
        } else if (node.children) {
            const filtered = filterNodes(node.children, q);
            if (filtered.length) acc.push({ ...node, children: filtered });
        }
        return acc;
    }, []);
}
const filteredNodes = ref(PROCESS_TREE);

function onSearch() {
    filteredNodes.value = filterNodes(PROCESS_TREE, searchQuery.value);
}

// ── Selección de nodo ─────────────────────────────────────────────────────────
function onNodeSelect(node) {
    if (node.type === 'tag') {
        emit('add-tag', { key: node.key, ...node.data });
    }
}

// ── Icono por tipo de nodo ────────────────────────────────────────────────────
function nodeIcon(node) {
    if (node.type === 'tag') {
        const t = node.data?.tipo;
        if (t === 'T') return 'pi pi-sun text-orange-400';
        if (t === 'P') return 'pi pi-gauge text-blue-400';
        if (t === 'F') return 'pi pi-arrow-right text-cyan-400';
        if (t === 'L') return 'pi pi-wave-pulse text-indigo-400';
        return 'pi pi-chart-line text-green-400';
    }
    if (node.type === 'area')   return 'pi pi-sitemap text-color-secondary';
    if (node.type === 'planta') return 'pi pi-building text-primary';
    return 'pi pi-map-marker text-primary';
}
</script>

<template>
    <div class="flex flex-column h-full gap-2" style="min-height: 0">
        <!-- Buscador -->
        <div class="px-2 pt-2">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText
                    v-model="searchQuery"
                    placeholder="Buscar tag..."
                    class="w-full"
                    size="small"
                    @input="onSearch"
                />
            </IconField>
        </div>

        <Divider class="my-1" />

        <!-- Hint -->
        <div class="px-2">
            <small class="text-color-secondary">
                <i class="pi pi-info-circle mr-1" />
                Doble clic en un tag para agregar al historial
            </small>
        </div>

        <!-- Árbol -->
        <div class="flex-1 overflow-y-auto px-1">
            <Tree
                :value="filteredNodes"
                v-model:expandedKeys="expandedKeys"
                selectionMode="single"
                :pt="{
                    root: { style: 'border: none; padding: 0' },
                    nodeLabel: { style: 'font-size: 0.8rem' },
                }"
                @node-dblclick="onNodeSelect"
                @node-select="() => {}"
            >
                <template #default="{ node }">
                    <div
                        class="flex align-items-center gap-2 py-1"
                        :class="{ 'cursor-pointer': node.type === 'tag' }"
                        @dblclick="onNodeSelect(node)"
                    >
                        <i :class="nodeIcon(node)" style="font-size: 0.85rem" />
                        <span
                            :class="[
                                'text-sm',
                                node.type === 'tag' ? 'font-medium' : 'font-semibold text-color-secondary'
                            ]"
                        >
                            {{ node.label }}
                        </span>
                        <Tag
                            v-if="node.type === 'tag'"
                            :value="node.data.unidad"
                            severity="secondary"
                            style="font-size: 0.65rem; padding: 1px 5px"
                        />
                    </div>
                </template>
            </Tree>
        </div>
    </div>
</template>
