<script setup>
import AuthLogoWidget from '@/components/auth/AuthLogoWidget.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import { generateRandomData } from '@/lib/utils';
import { onBeforeMount, ref } from 'vue';

const randomData = ref(null);

onBeforeMount(() => {
    randomData.value = generateRandomData('2020-10-27T00:00:00', '2023-11-03T00:00:00', 4, 10000, 50000, 2);
});

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
    <section class="landing-container relative py-12 lg:py-24">
        <div class="badge mx-auto w-fit">Feature</div>
        <h2 class="text-center text-4xl lg:text-5xl font-semibold mt-4 leading-none text-surface-950 dark:text-surface-0">
            Key Features for a<br class="hidden md:block" />
            Seamless Banking Experience
        </h2>
        <p class="mt-6 text-lg text-surface-500 dark:text-white/64 max-w-xl mx-auto text-center">Discover a range of features designed to provide secure, efficient, and user-friendly banking services.</p>
        <SectionCard class="flex-1 flex flex-col h-[25rem] mt-14">
            <template #title>
                <h4>Overview</h4>
            </template>
            <template #action>
                <div class="flex items-center gap-2">
                    <div class="px-3 py-1 rounded-full bg-surface-0 dark:bg-white/10 border dark:border-white/8 inline-flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-primary-500" />
                        <span class="text-sm font-medium text-surface-950 dark:text-surface-0">Revenue</span>
                    </div>
                </div>
            </template>
            <div class="flex-1 mt-6 w-full overflow-auto">
                <BarChart :label="'Revenue'" :dataset="randomData" tooltipPrefix="$" :option="'month'" className="min-w-[560px] flex-1 h-full w-full cursor-pointer" :step-size="10000" />
            </div>
        </SectionCard>
        <div class="flex items-center gap-6 my-6">
            <span class="flex-1 h-px w-full bg-primary-500/15" />
            <AuthLogoWidget class="w-10" />
            <span class="flex-1 h-px w-full bg-primary-500/15" />
        </div>
        <SectionCard>
            <template #title>Account History </template>
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
    </section>
</template>
