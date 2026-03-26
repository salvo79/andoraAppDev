<script setup>
import { useLayout } from '@/layout/composables/layout';
import { $t, updatePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import { ref } from 'vue';

const { layoutState, layoutConfig, changeMenuMode, updateBodyBackground } = useLayout();

defineProps({
    location: {
        type: String,
        default: 'app'
    },
    simple: {
        type: Boolean,
        default: false
    }
});

const presets = {
    Aura,
    Lara
};
const presetOptions = ref(Object.keys(presets));
const preset = ref(layoutConfig.preset);
const themeOptions = ref([
    { name: 'Light', value: false },
    { name: 'Dark', value: true }
]);

const darkTheme = ref(layoutConfig.darkTheme);
const menuMode = ref(layoutConfig.menuMode);

const primaryColors = ref([
    { name: 'noir', palette: {} },
    { name: 'emerald', palette: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' } },
    { name: 'green', palette: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16' } },
    { name: 'lime', palette: { 50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635', 500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314', 950: '#1a2e05' } },
    { name: 'orange', palette: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' } },
    { name: 'amber', palette: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' } },
    { name: 'yellow', palette: { 50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006' } },
    { name: 'teal', palette: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e' } },
    { name: 'cyan', palette: { 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344' } },
    { name: 'sky', palette: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49' } },
    { name: 'blue', palette: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' } },
    { name: 'indigo', palette: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' } },
    { name: 'violet', palette: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065' } },
    { name: 'purple', palette: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' } },
    { name: 'fuchsia', palette: { 50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75', 950: '#4a044e' } },
    { name: 'pink', palette: { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724' } },
    { name: 'rose', palette: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' } }
]);

function executeDarkModeToggle() {
    layoutConfig.darkTheme = !layoutConfig.darkTheme;
    document.documentElement.classList.toggle('app-dark');
    updateBodyBackground(layoutConfig.primary);
}

function handleToggleDarkMode() {
    if (!document.startViewTransition) {
        executeDarkModeToggle();

        return;
    }

    document.startViewTransition(() => {
        executeDarkModeToggle();
    });
}

function updateColors(type, color) {
    layoutConfig.primary = color.name;

    updatePreset(getPresetExt());
    updateBodyBackground(color.name);
}

function onPresetChange() {
    layoutConfig.preset = preset.value;
    const presetValue = presets[preset.value];

    $t().preset(presetValue).preset(getPresetExt()).use({ useDefaultOptions: true });
}

function getPresetExt() {
    const color = primaryColors.value.find((c) => c.name === layoutConfig.primary);

    if (color.name === 'noir') {
        return {
            semantic: {
                primary: {
                    50: '{zinc.50}',
                    100: '{zinc.100}',
                    200: '{zinc.200}',
                    300: '{zinc.300}',
                    400: '{zinc.400}',
                    500: '{zinc.500}',
                    600: '{zinc.600}',
                    700: '{zinc.700}',
                    800: '{zinc.800}',
                    900: '{zinc.900}',
                    950: '{zinc.950}'
                },
                colorScheme: {
                    light: {
                        primary: {
                            color: '{primary.950}',
                            contrastColor: '#ffffff',
                            hoverColor: '{primary.800}',
                            activeColor: '{primary.700}'
                        },
                        highlight: {
                            background: '{primary.950}',
                            focusBackground: '{primary.700}',
                            color: '#ffffff',
                            focusColor: '#ffffff'
                        },
                        surface: {
                            0: '#ffffff',
                            50: '{zinc.50}',
                            100: '{zinc.100}',
                            200: '{zinc.200}',
                            300: '{zinc.300}',
                            400: '{zinc.400}',
                            500: '{zinc.500}',
                            600: '{zinc.600}',
                            700: '{zinc.700}',
                            800: '{zinc.800}',
                            900: '{zinc.900}',
                            950: '{zinc.950}'
                        }
                    },
                    dark: {
                        primary: {
                            color: '{primary.50}',
                            contrastColor: '{primary.950}',
                            hoverColor: '{primary.200}',
                            activeColor: '{primary.300}'
                        },
                        highlight: {
                            background: '{primary.50}',
                            focusBackground: '{primary.300}',
                            color: '{primary.950}',
                            focusColor: '{primary.950}'
                        },
                        surface: {
                            0: '#ffffff',
                            50: '{zinc.50}',
                            100: '{zinc.100}',
                            200: '{zinc.200}',
                            300: '{zinc.300}',
                            400: '{zinc.400}',
                            500: '{zinc.500}',
                            600: '{zinc.600}',
                            700: '{zinc.700}',
                            800: '{zinc.800}',
                            900: '{zinc.900}',
                            950: '{zinc.950}'
                        }
                    }
                }
            }
        };
    } else {
        return {
            semantic: {
                primary: color.palette,
                colorScheme: {
                    light: {
                        primary: {
                            color: '{primary.500}',
                            contrastColor: '#ffffff',
                            hoverColor: '{primary.600}',
                            activeColor: '{primary.700}'
                        },
                        highlight: {
                            background: '{primary.50}',
                            focusBackground: '{primary.100}',
                            color: '{primary.700}',
                            focusColor: '{primary.800}'
                        },
                        surface: {
                            0: 'color-mix(in srgb, {primary.900}, white 100%)',
                            50: 'color-mix(in srgb, {primary.900}, white 95%)',
                            100: 'color-mix(in srgb, {primary.900}, white 90%)',
                            200: 'color-mix(in srgb, {primary.900}, white 80%)',
                            300: 'color-mix(in srgb, {primary.900}, white 70%)',
                            400: 'color-mix(in srgb, {primary.900}, white 60%)',
                            500: 'color-mix(in srgb, {primary.900}, white 50%)',
                            600: 'color-mix(in srgb, {primary.900}, white 40%)',
                            700: 'color-mix(in srgb, {primary.900}, white 30%)',
                            800: 'color-mix(in srgb, {primary.900}, white 20%)',
                            900: 'color-mix(in srgb, {primary.900}, white 10%)',
                            950: 'color-mix(in srgb, {primary.900}, white 0%)'
                        }
                    },
                    dark: {
                        primary: {
                            color: '{primary.400}',
                            contrastColor: '{surface.900}',
                            hoverColor: '{primary.300}',
                            activeColor: '{primary.200}'
                        },
                        highlight: {
                            background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                            focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                            color: 'rgba(255,255,255,.87)',
                            focusColor: 'rgba(255,255,255,.87)'
                        },
                        surface: {
                            0: 'color-mix(in srgb, var(--surface-ground), white 100%)',
                            50: 'color-mix(in srgb, var(--surface-ground), white 95%)',
                            100: 'color-mix(in srgb, var(--surface-ground), white 90%)',
                            200: 'color-mix(in srgb, var(--surface-ground), white 80%)',
                            300: 'color-mix(in srgb, var(--surface-ground), white 70%)',
                            400: 'color-mix(in srgb, var(--surface-ground), white 60%)',
                            500: 'color-mix(in srgb, var(--surface-ground), white 50%)',
                            600: 'color-mix(in srgb, var(--surface-ground), white 40%)',
                            700: 'color-mix(in srgb, var(--surface-ground), white 30%)',
                            800: 'color-mix(in srgb, var(--surface-ground), white 20%)',
                            900: 'color-mix(in srgb, var(--surface-ground), white 10%)',
                            950: 'color-mix(in srgb, var(--surface-ground), white 5%)'
                        }
                    }
                }
            }
        };
    }
}
</script>

<template>
    <Drawer
        v-model:visible="layoutState.configSidebarVisible"
        position="right"
        header="Settings"
        class="layout-config-sidebar w-80"
        :pt="{
            pcCloseButton: { root: 'ml-auto' }
        }"
    >
        <div class="flex flex-col gap-6">
            <div>
                <span class="text-lg text-muted-color font-semibold">Primary</span>
                <div class="pt-2 flex gap-2 flex-wrap">
                    <button
                        v-for="primaryColor of primaryColors"
                        :key="primaryColor.name"
                        type="button"
                        @click="updateColors('primary', primaryColor)"
                        class="w-6 h-6 cursor-pointer hover:shadow-lg rounded duration-150 flex items-center justify-center"
                        :style="{ backgroundColor: `${primaryColor.name === 'noir' ? 'light-dark(#000000, #ffffff)' : primaryColor.palette['500']}` }"
                    >
                        <i v-if="primaryColor.name === layoutConfig.primary" class="pi pi-check text-white" />
                    </button>
                </div>
            </div>

            <div>
                <div class="flex flex-col gap-2">
                    <span class="text-lg text-muted-color font-semibold">Presets</span>
                    <SelectButton v-model="preset" @change="onPresetChange" :options="presetOptions" :allowEmpty="false" />
                </div>
            </div>

            <div>
                <div class="flex flex-col gap-2">
                    <span class="text-lg text-muted-color font-semibold">Color Scheme</span>
                    <SelectButton v-model="darkTheme" @change="handleToggleDarkMode" :options="themeOptions" optionLabel="name" optionValue="value" :allowEmpty="false" />
                </div>
            </div>

            <div v-if="!simple && location === 'app'">
                <div class="flex flex-col gap-2">
                    <span class="text-lg text-muted-color font-semibold">Menu Type</span>
                    <div class="flex flex-wrap flex-col gap-3">
                        <div class="flex">
                            <div class="flex items-center gap-2 w-6/12">
                                <RadioButton name="menuMode" value="static" v-model="menuMode" @update:modelValue="changeMenuMode" inputId="static" />
                                <label for="static">Static</label>
                            </div>

                            <div class="flex items-center gap-2 w-6/12">
                                <RadioButton name="menuMode" value="overlay" v-model="menuMode" @update:modelValue="changeMenuMode" inputId="overlay" />
                                <label for="overlay">Overlay</label>
                            </div>
                        </div>
                        <div class="flex">
                            <div class="flex items-center gap-2 w-6/12">
                                <RadioButton name="menuMode" value="slim" v-model="menuMode" @update:modelValue="changeMenuMode" inputId="slim" />
                                <label for="slim">Slim</label>
                            </div>
                            <div class="flex items-center gap-2 w-6/12">
                                <RadioButton name="menuMode" value="compact" v-model="menuMode" @update:modelValue="changeMenuMode" inputId="compact" />
                                <label for="compact">Compact</label>
                            </div>
                        </div>
                        <div class="flex">
                            <div class="flex items-center gap-2 w-6/12">
                                <RadioButton name="menuMode" value="reveal" v-model="menuMode" @update:modelValue="changeMenuMode" inputId="reveal" />
                                <label for="reveal">Reveal</label>
                            </div>
                            <div class="flex items-center gap-2 w-6/12">
                                <RadioButton name="menuMode" value="drawer" v-model="menuMode" @update:modelValue="changeMenuMode" inputId="drawer" />
                                <label for="drawer">Drawer</label>
                            </div>
                        </div>
                        <div class="flex">
                            <div class="flex items-center gap-2 w-6/12">
                                <RadioButton name="menuMode" value="horizontal" v-model="menuMode" @update:modelValue="changeMenuMode" inputId="horizontal" />
                                <label for="horizontal">Horizontal</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Drawer>
</template>
