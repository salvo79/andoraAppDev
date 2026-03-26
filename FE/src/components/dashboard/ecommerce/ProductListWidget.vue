<script setup>
import SectionCard from '@/components/ui/SectionCard.vue';
import { ref } from 'vue';

const productList = ref([
    {
        product: 'iPhone 16 Pro',
        owner: 'Jerome Bell',
        image: '/images/ecommerce-productlist-1.png',
        status: 'success'
    },
    {
        product: 'iPhone 15 Pro',
        owner: 'Amelia White',
        image: '/images/ecommerce-productlist-2.png',
        status: 'danger'
    },
    {
        product: 'Apple Watch 10',
        owner: 'Oliver Smith',
        image: '/images/ecommerce-productlist-3.png',
        status: 'success'
    },
    {
        product: 'AirPods 4',
        owner: 'Sophia Johnson',
        image: '/images/ecommerce-productlist-4.png',
        status: 'danger'
    },
    {
        product: 'Apple Watch 9',
        owner: 'Liam Brown',
        image: '/images/ecommerce-productlist-5.png',
        status: 'success'
    }
]);

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
        <template #title>Product List</template>
        <template #action>
            <Button icon="pi pi-ellipsis-h" severity="secondary" text @click="toggle" />
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
        </template>
        <div class="flex-1 mt-6 flex flex-col justify-between gap-6">
            <template v-for="(item, index) of productList" :key="index">
                <div class="flex items-center gap-3">
                    <Avatar :image="item.image" class="w-10! h-10! rounded-lg! overflow-hidden!" />
                    <div class="flex-1">
                        <div class="font-medium text-surface-950 dark:text-surface-0">{{ item.product }}</div>
                        <div class="mt-px text-sm text-surface-500 dark:text-white/40">{{ item.owner }}</div>
                    </div>
                    <span>
                        <i v-if="item.status === 'success'" class="pi pi-arrow-up-right text-green-600" />
                        <i v-else class="pi pi-arrow-down-left text-red-600" />
                    </span>
                </div>
            </template>
        </div>
    </SectionCard>
</template>
