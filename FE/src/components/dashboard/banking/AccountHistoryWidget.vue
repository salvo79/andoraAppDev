<script setup>
import SectionCard from '@/components/ui/SectionCard.vue';
import { ref } from 'vue';

const accountHistory = ref([
    {
        name: 'Jerome Bell',
        date: 'May 5th, 2024',
        amount: {
            orientation: 'up',
            value: '+£12.875,98'
        },
        account: '**** **** 8288'
    },
    {
        name: 'Annette Black',
        date: 'Mar 17th, 2024',
        amount: {
            orientation: 'up',
            value: '+€7.245,44'
        },
        account: '**** **** 9284'
    },
    {
        name: 'Onyama Limba',
        date: 'May 24th, 2024',
        amount: {
            orientation: 'down',
            value: '-₺76.276,90'
        },
        account: '**** **** 2534'
    },
    {
        name: 'Courtney Henry',
        date: 'Jun 28th, 2024',
        amount: {
            orientation: 'down',
            value: '-£2.875,98'
        },
        account: '**** **** 8288'
    },
    {
        name: 'Dianne Russell',
        date: 'Jul 21th, 2024',
        amount: {
            orientation: 'up',
            value: '+$12.423,04'
        },
        account: '**** **** 8234'
    },
    {
        name: 'Amy Elsner',
        date: 'Jul 21th, 2024',
        amount: {
            orientation: 'up',
            value: '+€17.876,24'
        },
        account: '**** **** 9284'
    }
]);
</script>

<template>
    <SectionCard>
        <template #title>Account History </template>
        <template #action>
            <Button label="View All" rounded text severity="contrast" class="py-0.5! px-1.5! text-sm!" />
        </template>
        <template #description>In this area you can see the flow of account.</template>
        <div class="mt-10 overflow-auto">
            <DataTable
                :value="accountHistory"
                tableStyle="min-width: 40rem"
                :pt="{
                    column: {
                        headerCell: {
                            class: 'bg-transparent!'
                        }
                    },
                    bodyRow: {
                        class: 'bg-transparent!'
                    }
                }"
            >
                <Column field="name" header="Name" />
                <Column field="date" header="Date" />
                <Column field="amount" header="Amount">
                    <template #body="slotProps">
                        <div :class="{ 'text-red-600 dark:text-red-400': slotProps.data.amount.orientation === 'down', 'text-green-600 dark:text-green-400': slotProps.data.amount.orientation === 'up' }">
                            {{ slotProps.data.amount.value }}
                        </div>
                    </template>
                </Column>
                <Column field="account" header="Account" />
                <Column class="w-9" field="" header="">
                    <template #body>
                        <button class="w-9 h-9 flex items-center justify-center"><i class="pi pi-ellipsis-h" /></button>
                    </template>
                </Column>
            </DataTable>
        </div>
    </SectionCard>
</template>
