import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';

const layoutConfig = reactive({
    preset: 'Aura',
    primary: 'blue',
    darkTheme: false,
    menuMode: 'static'
});

const layoutState = reactive({
    staticMenuInactive: false,
    overlayMenuActive: false,
    rightMenuVisible: false,
    configSidebarVisible: false,
    mobileMenuActive: false,
    searchBarActive: false,
    sidebarExpanded: false,
    menuHoverActive: false,
    activePath: null,
    anchored: false
});

const bodyBackgroundPalette = {
    light: {
        noir: 'linear-gradient(180deg, #F4F4F5 0%, rgba(212, 212, 216, 0.12) 100%)',
        blue: 'linear-gradient(180deg, #e0e7f5 0%, rgba(170, 194, 239, 0.06) 111.26%)',
        green: 'linear-gradient(180deg, #e0f5e1 0%, rgba(170, 239, 172, 0.06) 111.26%)',
        violet: 'linear-gradient(180deg, #e9e0f5 0%, rgba(198, 170, 239, 0.06) 111.26%)',
        orange: 'linear-gradient(180deg, #f5e9e0 0%, rgba(239, 199, 170, 0.06) 111.26%)',
        rose: 'linear-gradient(180deg, #f5e0e3 0%, rgba(239, 170, 180, 0.06) 111.26%)',
        cyan: 'linear-gradient(180deg, #e0f2f5 0%, rgba(170, 229, 239, 0.06) 111.26%)',
        pink: 'linear-gradient(180deg, #f5e0eb 0%, rgba(239, 170, 205, 0.06) 111.26%)',
        red: 'linear-gradient(180deg, #f5e0e0 0%, rgba(239, 170, 170, 0.06) 111.26%)',
        amber: 'linear-gradient(180deg, #f5ede0 0%, rgba(239, 214, 170, 0.06) 111.26%)',
        yellow: 'linear-gradient(180deg, #f5f0e0 0%, rgba(239, 222, 170, 0.06) 111.26%)',
        lime: 'linear-gradient(180deg, #edf5e0 0%, rgba(212, 239, 170, 0.06) 111.26%)',
        emerald: 'linear-gradient(180deg, #e0f5ee 0%, rgba(170, 239, 216, 0.06) 111.26%)',
        teal: 'linear-gradient(180deg, #e0f5f3 0%, rgba(170, 239, 231, 0.06) 111.26%)',
        sky: 'linear-gradient(180deg, #e0eef5 0%, rgba(170, 217, 239, 0.06) 111.26%)',
        purple: 'linear-gradient(180deg, #ebe0f5 0%, rgba(206, 170, 239, 0.06) 111.26%)',
        fuchsia: 'linear-gradient(180deg, #f2e0f5 0%, rgba(230, 170, 239, 0.06) 111.26%)',
        indigo: 'linear-gradient(180deg, #e0e1f5 0%, rgba(170, 171, 239, 0.06) 111.26%)'
    },
    dark: {
        noir: '#09090b',
        blue: '#000C23',
        green: '#00231B',
        violet: '#0E0023',
        orange: '#231500',
        rose: '#230023',
        cyan: '#001E23',
        pink: '#230012',
        red: '#230000',
        amber: '#231600',
        yellow: '#231B00',
        lime: '#152300',
        emerald: '#002318',
        teal: '#00231F',
        sky: '#001823',
        purple: '#120023',
        fuchsia: '#1F0023',
        indigo: '#000123'
    }
};

export function useLayout() {
    const route = useRoute();

    const toggleMenu = () => {
        if (isDesktop()) {
            if (layoutConfig.menuMode === 'static') {
                layoutState.staticMenuInactive = !layoutState.staticMenuInactive;
            }

            if (layoutConfig.menuMode === 'overlay') {
                layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
            }
        } else {
            layoutState.mobileMenuActive = !layoutState.mobileMenuActive;
        }
    };

    const toggleConfigSidebar = () => {
        layoutState.configSidebarVisible = !layoutState.configSidebarVisible;
    };

    const hideMobileMenu = () => {
        layoutState.mobileMenuActive = false;
    };

    const changeMenuMode = (menuMode) => {
        layoutConfig.menuMode = menuMode;
        layoutState.staticMenuInactive = false;
        layoutState.overlayMenuActive = false;
        layoutState.mobileMenuActive = false;
        layoutState.sidebarExpanded = false;
        layoutState.menuHoverActive = false;
        layoutState.anchored = false;

        if (isDesktop()) {
            layoutState.activePath = hasOverlaySubmenu.value ? null : route.path;
        }
    };

    const updateBodyBackground = (color) => {
        const root = document.documentElement;
        const colorScheme = isDarkTheme.value ? bodyBackgroundPalette.dark : bodyBackgroundPalette.light;
        root.style.setProperty('--surface-ground', colorScheme[color]);
    };

    const isDarkTheme = computed(() => layoutConfig.darkTheme);
    const isDesktop = () => window.innerWidth > 991;
    const isHorizontal = computed(() => layoutConfig.menuMode === 'horizontal');
    const isCompact = computed(() => layoutConfig.menuMode === 'compact');
    const isSlim = computed(() => layoutConfig.menuMode === 'slim');

    const hasOverlaySubmenu = computed(() => layoutConfig.menuMode === 'slim' || layoutConfig.menuMode === 'compact' || layoutConfig.menuMode === 'horizontal');
    const hasOpenOverlaySubmenu = computed(() => hasOverlaySubmenu.value && layoutState.activePath !== null && layoutState.activePath !== '/');
    const hasOpenOverlay = computed(() => layoutState.overlayMenuActive || hasOpenOverlaySubmenu.value);

    return {
        layoutConfig,
        layoutState,
        isDarkTheme,
        toggleConfigSidebar,
        toggleMenu,
        hasOpenOverlay,
        hasOverlaySubmenu,
        hasOpenOverlaySubmenu,
        hideMobileMenu,
        changeMenuMode,
        isHorizontal,
        isCompact,
        isSlim,
        isDesktop,
        updateBodyBackground
    };
}
