<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { ref } from 'vue';
import AppBreadcrumb from './AppBreadcrumb.vue';
const router = useRouter();
const auth = useAuthStore();
const { layoutState, isDarkTheme, toggleMenu, toggleConfigSidebar } = useLayout();
const baseUrl = import.meta.env.BASE_URL;


function logout() {
    auth.logout();
    router.push('/landing/login');
}

const notificationsBars = [
    {
        id: 'inbox',
        label: 'Inbox',
        badge: '2'
    },
    {
        id: 'general',
        label: 'General'
    },
    {
        id: 'archived',
        label: 'Archived'
    }
];

const selectedNotificationBar = ref(notificationsBars?.[0].id ?? 'inbox');
const notificationSearch = ref('');
const notifications = [
    {
        id: 'inbox',
        data: [
            {
                image: '/demo/images/avatar/avatar-square-m-2.jpg',
                name: 'Michael Lee',
                description: 'You have a new message from the support team regarding your recent inquiry.',
                time: '1 hour ago',
                attachment: {
                    title: 'Contract',
                    size: '2.1 MB'
                },
                read: false
            },
            {
                image: '/demo/images/avatar/avatar-square-f-1.jpg',
                name: 'Alice Johnson',
                description: 'Your report has been successfully submitted and is under review.',
                time: '10 minutes ago',
                read: true
            },
            {
                image: '/demo/images/avatar/avatar-square-f-2.jpg',
                name: 'Emily Davis',
                description: 'The project deadline has been updated to September 30th. Please check the details.',
                time: 'Yesterday at 4:35 PM',
                read: false
            }
        ]
    },
    {
        id: 'general',
        data: [
            {
                image: '/demo/images/avatar/avatar-square-f-1.jpg',
                name: 'Alice Johnson',
                description: 'Reminder: Your subscription is about to expire in 3 days. Renew now to avoid interruption.',
                time: '30 minutes ago',
                read: true
            },
            {
                image: '/demo/images/avatar/avatar-square-m-2.jpg',
                name: 'Michael Lee',
                description: 'The server maintenance has been completed successfully. No further downtime is expected.',
                time: 'Yesterday at 2:15 PM',
                read: false
            }
        ]
    },
    {
        id: 'archived',
        data: [
            {
                image: '/demo/images/avatar/avatar-square-m-1.jpg',
                name: 'Lucas Brown',
                description: 'Your appointment with Dr. Anderson has been confirmed for October 12th at 10:00 AM.',
                time: '1 week ago',
                read: false
            },
            {
                image: '/demo/images/avatar/avatar-square-f-2.jpg',
                name: 'Emily Davis',
                description: 'The document you uploaded has been successfully archived for future reference.',
                time: '2 weeks ago',
                read: true
            }
        ]
    }
];

function toggleSearchBar() {
    layoutState.searchBarActive = !layoutState.searchBarActive;
}

function showRightMenu() {
    layoutState.rightMenuVisible = !layoutState.rightMenuVisible;
}
</script>

<template>
    <div class="layout-topbar">
        <div class="topbar-left">
            <a tabindex="0" class="menu-button" @click="toggleMenu">
                <i class="pi pi-chevron-left" />
            </a>
            <img class="horizontal-logo" :src="`${baseUrl}andora.svg`" alt="anDora" />
            <span class="topbar-separator" />
            <AppBreadcrumb />
            <RouterLink to="/"><img class="mobile-logo" :src="`${baseUrl}andora.svg`" alt="anDora" /></RouterLink>
        </div>

        <div class="topbar-right">
            <ul class="topbar-menu">
                <li class="right-sidebar-item">
                    <a class="right-sidebar-button cursor-pointer" @click="toggleSearchBar">
                        <i class="pi pi-search" />
                    </a>
                </li>
                <li class="right-sidebar-item">
                    <button type="button" class="app-config-button cursor-pointer" @click="toggleConfigSidebar" aria-label="Toggle Config Sidebar">
                        <i class="pi pi-cog" />
                    </button>
                </li>
                <li class="right-sidebar-item static sm:relative">
                    <a
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'p-anchored-overlay-enter-active', leaveActiveClass: 'p-anchored-overlay-leave-active', leaveToClass: 'hidden', hideOnOutsideClick: true }"
                        class="right-sidebar-button relative z-50 cursor-pointer"
                    >
                        <span class="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2.5" />
                        <i class="pi pi-bell" />
                    </a>
                    <div
                        class="list-none m-0 py-4 px-4 rounded-3xl border border-surface absolute bg-surface-0 dark:bg-surface-900 overflow-hidden hidden origin-top min-w-72 sm:w-[24rem] mt-2 right-0 z-50 top-auto shadow-[0px_56px_16px_0px_rgba(0,0,0,0.00),0px_36px_14px_0px_rgba(0,0,0,0.01),0px_20px_12px_0px_rgba(0,0,0,0.02),0px_9px_9px_0px_rgba(0,0,0,0.03),0px_2px_5px_0px_rgba(0,0,0,0.04)]"
                    >
                        <div class="flex items-center gap-2 justify-between">
                            <span class="text-lg font-medium text-surface-950 dark:text-surface-0">Notifications</span>
                            <button class="text-surface-700 dark:text-surface-300 text-sm font-medium cursor-pointer">Mark all as read</button>
                        </div>
                        <div class="my-2 shadow-custom-shadow border border-surface-200 dark:border-surface-800 bg-white/55 dark:bg-white/8 flex items-center gap-2 rounded-full p-1">
                            <button
                                v-for="(item, index) of notifications"
                                :key="index"
                                class="rounded-full p-2 flex-1 flex items-center justify-center transition-all cursor-pointer"
                                :class="selectedNotificationBar === item.id ? 'bg-primary-100 dark:bg-primary-900' : 'hover:bg-primary-100/30 dark:hover:bg-primary-900/30'"
                                @click="selectedNotificationBar = item.id"
                            >
                                <span class="capitalize font-medium text-surface-950 dark:text-surface-0">{{ item.id }}</span>
                            </button>
                        </div>
                        <div class="mt-4 mb-8">
                            <IconField>
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="notificationSearch" placeholder="Search" class="w-full!" />
                            </IconField>
                        </div>
                        <ul class="flex flex-col gap-8">
                            <li v-for="(item, index) of notifications.find((item) => item.id === selectedNotificationBar).data" :key="index" class="flex gap-3">
                                <div class="flex flex-col items-center gap-1">
                                    <OverlayBadge severity="danger" class="inline-flex">
                                        <Avatar :image="item.image" class="w-10! h-10!" shape="circle" />
                                    </OverlayBadge>
                                    <span class="flex-1 w-px bg-surface-200 dark:bg-surface-800" />
                                </div>
                                <div class="flex-1 pt-2 space-y-2">
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="font-medium text-surface-950 dark:text-surface-0">{{ item.name }}</span>
                                        <div class="text-sm text-surface-700 dark:text-surface-200 flex items-center gap-1">
                                            {{ item.time }}
                                            <div v-if="!item.read" class="w-2! h-2! rounded-full bg-green-500" />
                                        </div>
                                    </div>
                                    <div class="p-2 bg-surface-100 dark:bg-surface-800 border border-surface rounded-lg">
                                        <p class="text-sm text-surface-700 dark:text-surface-200 line-clamp-2 text-ellipsis">
                                            {{ item.description }}
                                        </p>
                                    </div>
                                    <div v-if="item.attachment" class="p-2 bg-surface-100 dark:bg-surface-800 border border-surface rounded-lg flex items-start gap-3">
                                        <div class="w-8 h-8 flex items-center justify-center rounded-md shadow-sm bg-surface-0 dark:bg-surface-950">
                                            <i class="pi pi-file-pdf text-primary" />
                                        </div>
                                        <div class="flex-1 flex flex-col gap-0.5">
                                            <span class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ item.attachment.title }}</span>
                                            <span class="text-xs text-surface-700 dark:text-surface-200">{{ item.attachment.size }}</span>
                                        </div>
                                        <Button icon="pi pi-download" severity="contrast" class="w-8! h-8! p-0!" />
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </li>

                <li class="profile-item static sm:relative">
                    <a
                        class="bg-none! border-none! outline-none!"
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'p-anchored-overlay-enter-active', leaveActiveClass: 'p-anchored-overlay-leave-active', leaveToClass: 'hidden', hideOnOutsideClick: true }"
                    >
                        <Avatar
                            :image="auth.profilePhoto || '/layout/images/profile.jpg'"
                            pt:image:class="rounded-lg! object-cover"
                            class="w-10! h-10!"
                        />
                    </a>
                    <div
                        class="list-none p-2 m-0 rounded-2xl border border-surface overflow-hidden absolute bg-surface-0 dark:bg-surface-900 hidden origin-top w-52 mt-2 right-0 z-[999] top-auto shadow-[0px_56px_16px_0px_rgba(0,0,0,0.00),0px_36px_14px_0px_rgba(0,0,0,0.01),0px_20px_12px_0px_rgba(0,0,0,0.02),0px_9px_9px_0px_rgba(0,0,0,0.03),0px_2px_5px_0px_rgba(0,0,0,0.04)]"
                    >
                        <div class="px-2.5 py-2 mb-1 border-b border-surface">
                            <p class="font-semibold text-surface-900 dark:text-surface-0 text-sm">{{ auth.user }}</p>
                        </div>
                        <ul class="flex flex-col gap-1">
                            <li>
                                <a @click="router.push('/profile')" class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis cursor-pointer">
                                    <i class="pi pi-user" />
                                    <span>Mi Perfil</span>
                                </a>
                            </li>
                            <li>
                                <a class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis cursor-pointer">
                                    <i class="pi pi-cog" />
                                    <span>Settings</span>
                                </a>
                            </li>
                            <li>
                                <a class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis cursor-pointer">
                                    <i class="pi pi-calendar" />
                                    <span>Calendar</span>
                                </a>
                            </li>
                            <li>
                                <a class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis cursor-pointer">
                                    <i class="pi pi-inbox" />
                                    <span>Inbox</span>
                                </a>
                            </li>
                            <li>
                                <a @click="logout" class="label-small dark:text-surface-400 flex gap-2 py-2 px-2.5 rounded-lg items-center hover:bg-emphasis cursor-pointer">
                                    <i class="pi pi-power-off" />
                                    <span>Log out</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>

                <li class="right-sidebar-item">
                    <a tabindex="0" class="right-sidebar-button" @click="showRightMenu">
                        <i class="pi pi-align-right" />
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>
