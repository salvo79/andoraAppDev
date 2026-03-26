<!-- FooterWidget.vue -->
<script setup>
import { ref } from 'vue';
import { useGlobalVarsStore } from '@/stores/GlobalVars';

const globalVars = useGlobalVarsStore();

const currentYear = new Date().getFullYear();
const navs = ref([
    {
        to: '',
        label: 'Product'
    },
    {
        to: '',
        label: 'Contact'
    },
    {
        to: '',
        label: 'Login'
    },
    {
        to: '',
        label: 'Register'
    }
]);
const socials = ref([
    {
        to: '#',
        icon: 'pi pi-youtube'
    },
    {
        to: '#',
        icon: 'pi pi-twitter'
    },
    {
        to: '#',
        icon: 'pi pi-discord'
    }
]);
</script>

<template>
    <div class="relative z-20 landing-container mx-auto md:pt-20 md:pb-14 py-8">
        <footer class="flex items-center justify-between md:flex-row flex-col gap-8 md:gap-0">
            <div class="flex items-center md:flex-row flex-col gap-8 md:gap-0">
                <router-link to="/">
                    <img src="/andora.svg" alt="anDora" class="h-8" />
                </router-link>
                <div class="h-4 w-[1px] bg-surface-200 dark:bg-surface-800 mx-4 md:block hidden" />
                <ul class="flex items-center gap-4">
                    <li v-for="(nav, index) of navs" :key="index">
                        <router-link :to="nav.to" class="body-small hover:underline">
                            {{ nav.label }}
                        </router-link>
                    </li>
                </ul>
            </div>
            <ul class="flex items-center gap-2">
                <li v-for="(data, index) of socials" :key="index">
                    <a
                        :href="data.to"
                        target="_blank"
                        class="px-4 py-2 rounded-full border border-surface-200 dark:border-surface-800 text-surface-950 dark:text-surface-0 flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                    >
                        <i :class="data.icon" class="text-md leading-none" />
                    </a>
                </li>
            </ul>
        </footer>
        <div class="w-full h-[1px] bg-surface-200 dark:bg-surface-800 my-7 md:my-4" />
        <div class="text-center body-small">© {{ currentYear }} {{ globalVars.firm }}</div>
    </div>
</template>
