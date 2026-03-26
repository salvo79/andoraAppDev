<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';
import AppBreadcrumb from './AppBreadcrumb.vue';
import AppConfig from './AppConfig.vue';
import AppFooter from './AppFooter.vue';
import AppRightMenu from './AppRightMenu.vue';
import AppSearch from './AppSearch.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';

const { layoutConfig, layoutState, hideMobileMenu } = useLayout();

const containerClass = computed(() => {
    return [
        {
            'layout-overlay': layoutConfig.menuMode === 'overlay',
            'layout-static': layoutConfig.menuMode === 'static',
            'layout-slim': layoutConfig.menuMode === 'slim',
            'layout-horizontal': layoutConfig.menuMode === 'horizontal',
            'layout-compact': layoutConfig.menuMode === 'compact',
            'layout-reveal': layoutConfig.menuMode === 'reveal',
            'layout-drawer': layoutConfig.menuMode === 'drawer',
            'layout-overlay-active': layoutState.overlayMenuActive,
            'layout-mobile-active': layoutState.mobileMenuActive,
            'layout-static-inactive': layoutState.staticMenuInactive,
            'layout-sidebar-expanded': layoutState.sidebarExpanded,
            'layout-sidebar-anchored': layoutState.anchored
        }
    ];
});
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <img class="absolute w-[144px] h-auto top-0 left-0 mix-blend-color-dodge pointer-events-none hidden dark:block" src="/images/app-light-1.png" alt="App Light" />
        <img class="absolute w-[766px] h-auto top-0 right-0 mix-blend-color-dodge pointer-events-none hidden dark:block" src="/images/app-light-2.png" alt="App Light" />
        <img class="absolute w-[327px] h-auto bottom-0 left-52 mix-blend-color-dodge pointer-events-none hidden dark:block" src="/images/app-light-3.png" alt="App Light" />
        <AppSidebar />
        <div class="layout-content-wrapper">
            <div class="layout-content-wrapper-inside">
                <AppTopbar />
                <div class="layout-content">
                    <AppBreadcrumb />
                    <router-view />
                </div>
                <AppFooter />
            </div>
        </div>
        <AppConfig />
        <AppSearch />
        <AppRightMenu />
        <Toast />
        <div class="layout-mask" @click="hideMobileMenu" />
    </div>
                        <!-- 2. Coloca el componente aquí, dentro del layout-wrapper, para que flote sobre todo -->
        <FloatingChatIcon /> 
</template>
