<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  nodes:      { type: Array,  default: () => [] },
  searchText: { type: String, default: '' },
});

const emit = defineEmits(['node-click', 'node-dblclick']);

// ── Flatten tree into a list ───────────────────────────────────────────────
function flatten(nodes, depth = 0, parentKey = null) {
  const out = [];
  for (const n of (nodes || [])) {
    const kids = n.items || [];
    out.push({ node: n, depth, parentKey, key: n.id, hasKids: kids.length > 0 });
    out.push(...flatten(kids, depth + 1, n.id));
  }
  return out;
}

const flat = computed(() => flatten(props.nodes));

const parentOf = computed(() => {
  const m = new Map();
  flat.value.forEach(i => m.set(i.key, i.parentKey));
  return m;
});

// ── Expanded set ───────────────────────────────────────────────────────────
const expanded = ref(new Set());

watch(() => props.nodes, () => {
  const init = new Set();
  flat.value.forEach(({ node, key }) => { if (node.expanded) init.add(key); });
  expanded.value = init;
}, { immediate: true, deep: false });

function toggle(key) {
  const next = new Set(expanded.value);
  if (next.has(key)) next.delete(key); else next.add(key);
  expanded.value = next;
}

// ── Search: show matching nodes + their ancestors ──────────────────────────
const searchLow = computed(() => props.searchText.trim().toLowerCase());

const matchSet = computed(() => {
  if (!searchLow.value) return null;
  const s = new Set();
  flat.value.forEach(({ node, key, parentKey }) => {
    if ((node.text || '').toLowerCase().includes(searchLow.value)) {
      s.add(key);
      let pk = parentKey;
      while (pk !== null) { s.add(pk); pk = parentOf.value.get(pk) ?? null; }
    }
  });
  return s;
});

// ── Visible rows ───────────────────────────────────────────────────────────
const visible = computed(() => {
  if (matchSet.value !== null) return flat.value.filter(i => matchSet.value.has(i.key));
  return flat.value.filter(i => {
    let pk = i.parentKey;
    while (pk !== null) {
      if (!expanded.value.has(pk)) return false;
      pk = parentOf.value.get(pk) ?? null;
    }
    return true;
  });
});
</script>

<template>
  <div class="stree">
    <div
      v-for="item in visible"
      :key="item.key"
      class="stree-row"
      :style="{ paddingLeft: `${item.depth * 14 + 4}px` }"
      @click="item.hasKids ? toggle(item.key) : emit('node-click', item.node)"
      @dblclick="emit('node-dblclick', item.node)"
    >
      <i v-if="item.hasKids"
         class="stree-chev pi"
         :class="expanded.has(item.key) ? 'pi-chevron-down' : 'pi-chevron-right'"
         @click.stop="toggle(item.key)" />
      <span v-else class="stree-spacer" />
      <slot :node="item.node" :depth="item.depth" />
    </div>
    <div v-if="visible.length === 0 && nodes.length > 0" class="stree-empty">Sin resultados</div>
  </div>
</template>

<style scoped>
.stree { font-family: 'Segoe UI', system-ui, sans-serif; }
.stree-row {
  display: flex; align-items: center; gap: 4px;
  padding-top: 2px; padding-right: 6px; padding-bottom: 2px;
  cursor: pointer; border-radius: 3px; min-width: 0;
  transition: background 0.1s;
}
.stree-row:hover { background: var(--p-surface-100); }
.stree-chev {
  font-size: 0.6rem; color: var(--p-text-muted-color);
  flex-shrink: 0; width: 12px; text-align: center;
}
.stree-spacer { width: 12px; flex-shrink: 0; display: inline-block; }
.stree-empty { padding: 8px 10px; font-size: 0.72rem; color: var(--p-text-muted-color); }
</style>
