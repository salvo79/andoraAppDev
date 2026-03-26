<script setup>
import SectionCard from '@/components/ui/SectionCard.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { ref } from 'vue';

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const selectedEmailHistory = ref();
const emailHistory = ref([
    {
        id: '#12546',
        date: 'May 5th, 2024',
        name: {
            avatarStyle: 'bg-lime-200! text-lime-950!',
            value: 'Jerome Bell',
            shortValue: 'JB'
        },
        emailAddress: 'jeromebell@gmail.com',
        sent: '5',
        ctr: '1.32%',
        deliveredRate: '100%'
    },
    {
        id: '#12545',
        date: 'May 5th, 2024',
        name: {
            avatarStyle: 'bg-indigo-200! text-indigo-950!',
            value: 'Annette Black',
            shortValue: 'AB'
        },
        emailAddress: 'hi@annetteblack.com',
        sent: '7',
        ctr: '6.32%',
        deliveredRate: '100%'
    },
    {
        id: '#12544',
        date: 'May 5th, 2024',
        name: {
            avatarStyle: 'bg-rose-200! text-rose-950!',
            value: 'Onyama Limba',
            shortValue: 'OL'
        },
        emailAddress: 'hi@onyamalimba.co',
        sent: '12',
        ctr: '9.45%',
        deliveredRate: '100%'
    },
    {
        id: '#12543',
        date: 'May 5th, 2024',
        name: {
            avatarStyle: 'bg-violet-200! text-violet-950!',
            value: 'Courtney Henry',
            shortValue: 'CH'
        },
        emailAddress: 'hi@courtneyhenry.com',
        sent: '4',
        ctr: '4.57%',
        deliveredRate: '100%'
    },
    {
        id: '#12542',
        date: 'May 5th, 2024',
        name: {
            avatarStyle: 'bg-cyan-200! text-cyan-950!',
            value: 'Dianne Russell',
            shortValue: 'DR'
        },
        emailAddress: 'hi@diannerussell.com',
        sent: '17',
        ctr: '7.21%',
        deliveredRate: '100%'
    },
    {
        id: '#12541',
        date: 'May 5th, 2024',
        name: {
            avatarStyle: 'bg-yellow-200! text-yellow-950!',
            value: 'Amy Elsner',
            shortValue: 'AE'
        },
        emailAddress: 'hi@amyelsner.com',
        sent: '9',
        ctr: '3.32%',
        deliveredRate: '100%'
    },
    {
        id: '#12540',
        date: 'May 5th, 2024',
        name: {
            avatarStyle: 'bg-blue-200! text-blue-950!',
            value: 'Arlene McCoy',
            shortValue: 'AM'
        },
        emailAddress: 'hi@arlenemccoy.com',
        sent: '11',
        ctr: '8.15%',
        deliveredRate: '100%'
    }
]);
</script>

<template>
    <SectionCard>
        <div class="flex flex-wrap gap-2 items-center justify-between mb-6">
            <div>
                <h4 class="text-lg font-medium text-surface-950 dark:text-surface-0">Email History</h4>
                <p class="mt-1 text-sm text-surface-400 dark:text-white/64">This field displays the order history</p>
            </div>
            <div class="flex items-center gap-4">
                <IconField>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </IconField>
                <Button label="Filter" icon="pi pi-filter" rounded />
                <Button label="Export" icon="pi pi-download" severity="contrast" rounded />
            </div>
        </div>
        <DataTable
            ref="dt"
            v-model:selection="selectedEmailHistory"
            :value="emailHistory"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
        >
            <Column selectionMode="multiple" style="width: 3rem" :exportable="false" />
            <Column field="id" header="ID" style="min-width: 6rem" />
            <Column field="date" header="Date" style="min-width: 10rem" />
            <Column field="name" header="Name" style="min-width: 12rem">
                <template #body="slotProps">
                    <div class="flex items-center gap-2">
                        <Avatar :label="slotProps.data.name.shortValue" shape="circle" class="font-medium! text-sm!" :class="slotProps.data.name.avatarStyle" />
                        <div class="flex-1 font-medium text-surface-950 dark:text-surface-0 line-clamp-1">{{ slotProps.data.name.value }}</div>
                    </div>
                </template>
            </Column>
            <Column field="emailAddress" header="Email Address" style="min-width: 12rem" />
            <Column field="sent" header="Sent" style="min-width: 10rem" />
            <Column field="ctr" header="CTR" style="min-width: 10rem" />
            <Column field="deliveredRate" header="Delivered Rate" style="min-width: 10rem" />
            <Column :exportable="false" style="min-width: 4rem">
                <template #body="slotProps">
                    <Button icon="pi pi-ellipsis-h" severity="secondary" text rounded @click="editProduct(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
    </SectionCard>
</template>
