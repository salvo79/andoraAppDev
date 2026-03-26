<script setup>
import AudienceByGenderWidget from '@/components/dashboard/marketing/AudienceByGenderWidget.vue';
import EmailDataChartWidget from '@/components/dashboard/marketing/EmailDataChartWidget.vue';
import EmailHistoryWidget from '@/components/dashboard/marketing/EmailHistoryWidget.vue';
import GlobalRankWidget from '@/components/dashboard/marketing/GlobalRankWidget.vue';
import InventoryManagementWidget from '@/components/dashboard/marketing/InventoryManagementWidget.vue';
import PromotionCampaignWidget from '@/components/dashboard/marketing/PromotionCampaignWidget.vue';
import SalesPerformanceWidget from '@/components/dashboard/marketing/SalesPerformanceWidget.vue';
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SalesPerformanceWidget />
            <InventoryManagementWidget />
            <PromotionCampaignWidget />
            <EmailDataChartWidget />
        </div>
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <AudienceByGenderWidget />
            <GlobalRankWidget />
            <VisitByDeviceWidget />
        </div>
        <EmailHistoryWidget />
    </div>
</template>
