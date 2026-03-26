<!-- TopbarWidget.vue -->
<script setup>
import LogoWidget from '@/components/landing/LogoWidget.vue';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const maxHeight = ref('0px');
const openMobileMenu = ref(false);

const navs = ref([
    {
        name: 'about',
        label: 'About',
        to: '/landing/about'
    },
    {
        name: 'pricing',
        label: 'Pricing',
        to: '/landing/pricing'
    },
    {
        name: 'contact',
        label: 'Contact',
        to: '/landing/contact'
    }
]);

const menuContent = ref(null);
const nav = ref(null);

const isAtTop = ref(true);

const activeRouteName = computed(() => route.name);

const maxHeightStyle = computed(() => {
    return openMobileMenu.value ? `${menuContent.value.scrollHeight}px` : maxHeight.value;
});

function handleClickOutside(event) {
    if (nav.value && !nav.value.contains(event.target)) {
        openMobileMenu.value = false;
    }
}

watch(openMobileMenu, (val) => {
    if (val) {
        document.addEventListener('click', handleClickOutside);
    } else {
        document.removeEventListener('click', handleClickOutside);
    }
});

function handleScroll() {
    isAtTop.value = window.scrollY === 0;
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <section>
        <nav
            class="landing-container fixed top-4 left-1/2 -translate-x-1/2 w-full z-[1000] transition-all duration-300"
            :class="{
                'md:min-w-[360px] max-w-[320px] md:max-w-[720px] lg:max-w-[900px]': !isAtTop,
                'max-w-full!': openMobileMenu
            }"
        >
            <div
                ref="nav"
                class="py-4 pl-4 md:pl-7 pr-4 rounded-3xl lg:rounded-full border border-transparent transition-all duration-300"
                :class="{
                    'backdrop-blur-[90px] border-surface-200 dark:border-white/10 bg-white/64 dark:bg-white/12! shadow-[0px_85px_24px_0px_rgba(0,0,0,0.00),_0px_55px_22px_0px_rgba(0,0,0,0.01),_0px_31px_18px_0px_rgba(0,0,0,0.02),_0px_14px_14px_0px_rgba(0,0,0,0.03),_0px_3px_8px_0px_rgba(0,0,0,0.04)] md:shadow-none':
                        openMobileMenu,
                    'backdrop-blur-[90px] border-surface-200 dark:border-white/10s bg-white/64 dark:bg-white/12! shadow-sm': !isAtTop
                }"
            >
                <div class="flex items-center justify-between">
                    <div class="flex-1 flex">
                        <router-link to="/landing" class="w-fit">
                            <LogoWidget />
                        </router-link>
                    </div>
                    <ul class="flex-none hidden md:flex items-center gap-2">
                        <li v-for="(nav, index) of navs" :key="index">
                            <router-link :to="nav.to" :class="activeRouteName === nav.name ? '' : 'hover:button'" class="px-4! py-2! min-w-20">
                                {{ nav.label }}
                            </router-link>
                        </li>
                    </ul>
                    <div class="flex-1 hidden md:flex items-center justify-end gap-4">
                        <router-link to="/landing/login" class="button py-2 px-4 min-w-20"> Login </router-link>
                        <router-link to="/landing/register" class="button-primary py-2 px-4 min-w-20"> Register </router-link>
                    </div>
                    <button
                        @click="openMobileMenu = !openMobileMenu"
                        class="flex md:hidden items-center justify-center rounded-lg text-surface-950 dark:text-surface-0 w-9 h-9 border border-surface-200 dark:border-white/10 hover:bg-surface-100 dark:hover:bg-white/10 transition-all"
                    >
                        <i class="leading-none" :class="openMobileMenu ? 'pi pi-times ' : 'pi pi-bars '" />
                    </button>
                </div>
                <div class="md:hidden block transition-all duration-300 ease-out overflow-hidden" :style="{ maxHeight: openMobileMenu ? maxHeightStyle : '0' }" :class="openMobileMenu ? 'mt-8 opacity-100' : 'opacity-0'">
                    <div ref="menuContent" class="flex flex-col gap-8 transition-all">
                        <ul class="flex flex-col gap-2">
                            <li v-for="(nav, index) of navs" :key="index">
                                <router-link
                                    :to="nav.to"
                                    @click="openMobileMenu = false"
                                    :class="activeRouteName === nav.name ? ' w-full bg-white dark:bg-white/10 border-surface dark:border-white/10' : ' '"
                                    class="button py-2 bg-transparent shadow-none hover:bg-white dark:hover:bg-white/10 hover:shadow-sm border border-transparent hover:border-surface dark:hover:border-white/10"
                                >
                                    {{ nav.label }}
                                </router-link>
                            </li>
                        </ul>
                        <div class="flex flex-col items-center gap-4">
                            <router-link to="/landing/login" class="button py-2 w-full border dark:border-white/10"> Login </router-link>
                            <router-link to="/landing/register" class="button-primary w-full py-2"> Register </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </section>
</template>
