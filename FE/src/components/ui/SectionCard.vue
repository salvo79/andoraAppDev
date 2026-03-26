<template>
    <div class="card">
        <div v-if="$slots.title || $slots.description || $slots.action" class="flex flex-wrap items-start justify-between gap-2">
            <div>
                <h4 v-if="$slots.title" class="text-lg font-medium text-surface-950 dark:text-surface-0">
                    <slot name="title" />
                </h4>
                <p v-if="$slots.description" class="mt-1 text-sm text-surface-500">
                    <slot name="description" />
                </p>
            </div>
            <slot name="action" />
        </div>
        <slot />
        <slot name="footer" />
    </div>
</template>
