<script setup>
import LeaderboardWidget from '@/components/dashboard/ecommerce/LeaderboardWidget.vue';
import ProductListWidget from '@/components/dashboard/ecommerce/ProductListWidget.vue';
import SellerListWidget from '@/components/dashboard/ecommerce/SellerListWidget.vue';
import StatsWidget from '@/components/dashboard/ecommerce/StatsWidget.vue';
import TopProductsWidget from '@/components/dashboard/ecommerce/TopProductsWidget.vue';
import TrafficWidget from '@/components/dashboard/ecommerce/TrafficWidget.vue';
</script>

<template>
    <div class="flex flex-col gap-6">
        <StatsWidget />
        <div class="w-full grid grid-cols-1 xl:grid-cols-3 gap-6">
            <TopProductsWidget />
            <TrafficWidget />
        </div>
        <div class="w-full grid grid-cols-1 xl:grid-cols-3 gap-6">
            <LeaderboardWidget />
            <ProductListWidget />
            <SellerListWidget />
        </div>
    </div>
</template>
