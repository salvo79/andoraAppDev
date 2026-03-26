<script setup>
import CreditCard from '@/components/ui/CreditCard.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import { ref } from 'vue';

const creditCardData = ref([
    {
        title: 'Your Balance',
        content: '$72,842.00'
    },
    {
        title: 'Spend Limit ',
        content: '$100,000.00'
    },
    {
        title: 'Currency',
        content: 'USD Dollar'
    }
]);
</script>

<template>
    <SectionCard class="flex flex-col md:flex-row xl:flex-col gap-10">
        <CreditCard name="Robert Jonas" last4digit="3772" addCard class="max-w-96 lg:max-w-none" />
        <div class="flex-1 flex flex-col gap-4">
            <div v-for="(item, index) of creditCardData" :key="index" class="inline-flex items-center justify-between gap-6">
                <span class="text-surface-500 dark:text-white/64">{{ item.title }}</span>
                <span class="text-right text-lg font-medium text-surface-950 dark:text-surface-0">{{ item.content }}</span>
            </div>
        </div>
    </SectionCard>
</template>
