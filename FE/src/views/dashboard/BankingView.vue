<script setup>
import AccountHistory from '@/components/dashboard/banking/AccountHistoryWidget.vue';
import CreditWidget from '@/components/dashboard/banking/CreditWidget.vue';
import LastCardMovementsWidget from '@/components/dashboard/banking/LastCardMovementsWidget.vue';
import OverviewWidget from '@/components/dashboard/banking/OverviewWidget.vue';
import StatWidget from '@/components/dashboard/banking/StatWidget.vue';
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div class="flex flex-col gap-6 flex-1 xl:col-span-2">
                <StatWidget />
                <OverviewWidget />
            </div>
            <CreditWidget />
        </div>
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div class="flex flex-col gap-6 flex-1 xl:col-span-2">
                <AccountHistory />
            </div>
            <LastCardMovementsWidget />
        </div>
    </div>
</template>
