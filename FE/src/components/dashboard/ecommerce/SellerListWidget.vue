<script setup>
import SectionCard from '@/components/ui/SectionCard.vue';
import { ref } from 'vue';

const sellerList = ref([
    {
        image: '/images/avatars/avatar-m-1.png',
        name: 'Brook Simmons',
        point: '4.8',
        menuItems: {
            label: 'Options',
            items: [
                {
                    label: 'Refresh',
                    icon: 'pi pi-refresh'
                }
            ]
        }
    },
    {
        image: '/images/avatars/avatar-f-1.png',
        name: 'Dianne Russell',
        point: '4.4',
        menuItems: {
            label: 'Options',
            items: [
                {
                    label: 'Refresh',
                    icon: 'pi pi-refresh'
                }
            ]
        }
    },
    {
        image: '/images/avatars/avatar-m-2.png',
        name: 'Jacob Jones',
        point: '4.2',
        menuItems: {
            label: 'Options',
            items: [
                {
                    label: 'Refresh',
                    icon: 'pi pi-refresh'
                }
            ]
        }
    },
    {
        image: '/images/avatars/avatar-m-3.png',
        name: 'Darrell Steward',
        point: '3.9',
        menuItems: {
            label: 'Options',
            items: [
                {
                    label: 'Refresh',
                    icon: 'pi pi-refresh'
                }
            ]
        }
    },
    {
        image: '/images/avatars/avatar-f-2.png',
        name: 'Arlene McCoy',
        point: '3.8',
        menuItems: {
            label: 'Options',
            items: [
                {
                    label: 'Refresh',
                    icon: 'pi pi-refresh'
                }
            ]
        }
    }
]);
const sellerListMenus = ref([]);
const toggleSellerListMenu = (event, index) => {
    sellerListMenus.value[index].toggle(event);
};
const menu = ref();
const items = ref([
    {
        label: 'Options',
        items: [
            {
                label: 'Refresh',
                icon: 'pi pi-refresh'
            },
            {
                label: 'Export',
                icon: 'pi pi-upload'
            }
        ]
    }
]);

function toggle(event) {
    menu.value.toggle(event);
}
</script>

<template>
    <SectionCard class="flex flex-col">
        <template #title>Seller List</template>
        <template #action>
            <Button icon="pi pi-ellipsis-h" severity="secondary" text @click="toggle" />
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
        </template>
        <div class="flex-1 mt-6 flex flex-col justify-between gap-6">
            <template v-for="(item, index) of sellerList" :key="index">
                <div class="flex items-center gap-3">
                    <Avatar :image="item.image" class="w-10! h-10! rounded-lg! overflow-hidden!" />
                    <div class="flex-1 font-medium text-surface-950 dark:text-surface-0 line-clamp-1">{{ item.name }}</div>
                    <div class="inline-flex items-center gap-1">
                        <i class="pi pi-star-fill text-yellow-500" />
                        <span class="font-medium text-surface-950 dark:text-surface-0">{{ item.point }}</span>
                    </div>
                    <Button icon="pi pi-ellipsis-h" severity="secondary" text @click="toggleSellerListMenu($event, index)" />
                    <Menu :ref="(el) => (sellerListMenus[index] = el)" id="overlay_menu" :model="items" :popup="true" />
                </div>
            </template>
        </div>
    </SectionCard>
</template>
