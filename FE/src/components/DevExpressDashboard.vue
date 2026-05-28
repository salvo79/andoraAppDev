<template>
    <div class="dash-placeholder">
        <i class="pi pi-chart-bar dash-icon" />
        <h2 class="dash-title">Dashboard BI</h2>
        <p class="dash-sub">Esta sección está pendiente de configuración.</p>
    </div>
</template>

<script setup>
</script>

<style scoped>
.dash-placeholder {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    height: 100%; min-height: 400px;
    gap: 12px; color: var(--p-text-muted-color);
}
.dash-icon  { font-size: 4rem; opacity: 0.15; }
.dash-title { font-size: 1.2rem; font-weight: 700; margin: 0; }
.dash-sub   { font-size: 0.85rem; margin: 0; }
</style>
