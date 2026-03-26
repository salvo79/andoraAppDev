<script setup>
import { ref } from 'vue';

const plans = ref(['3 Active Members', 'Up to 10 Components', 'High Request Limits', 'Unlimited Access', 'Advanced Analytics', 'Data Export', 'Prioritized Support', 'Real-time Updates', 'Batch Requests', 'Webhooks']);
const planDetails = ref([
    {
        title: 'basic',
        ingredients: ['$24', 'Unlimited', '10', '15', '_yes_', '_yes_', '_no_', '_no_', '_no_', '_no_']
    },
    {
        title: 'pro',
        ingredients: ['$64', 'Unlimited', 'Unlimited', '20', '_yes_', '_yes_', '_yes_', '_no_', '_no_', '_no_']
    },
    {
        title: 'premium',
        ingredients: ['$130', 'Unlimited', 'Unlimited', '25', '_yes_', '_yes_', '_yes_', '_yes_', '_no_', '_no_']
    },
    {
        title: 'team',
        ingredients: ['320$', 'Unlimited', 'Unlimited', 'Unlimited', '_yes_', '_yes_', '_yes_', '_yes_', '_yes_', '_yes_']
    }
]);
</script>

<template>
    <section class="landing-container py-24">
        <div class="hidden lg:grid grid-cols-[1.15fr,1fr,1fr,1fr,1fr] gap-4 p-7 rounded-3xl shadow-custom-shadow bg-white/64 dark:bg-white/10">
            <div class="divide-y divide-primary-500/10 shadow-custom-shadow bg-white dark:bg-white/12 rounded-xl">
                <div class="px-6 py-4 text-xl font-medium text-primary">Plan</div>
                <div v-for="(planTitle, index) of plans" :key="index" class="px-6 py-4 text-lg font-medium text-surface-950 dark:text-surface-0">
                    {{ planTitle }}
                </div>
            </div>
            <div v-for="(item, i) of planDetails" :key="i" class="divide-y divide-primary-500/10 shadow-custom-shadow bg-white dark:bg-white/12 rounded-xl">
                <div class="px-6 py-4 text-xl font-medium text-primary capitalize text-center">{{ item.title }}</div>
                <div v-for="(planIngredient, j) of item.ingredients" :key="j" class="px-6 py-4 text-center text-lg text-surface-950 dark:text-surface-0">
                    <i v-if="planIngredient === '_yes_'" class="pi pi-check" />
                    <i v-else-if="planIngredient === '_no_'" class="pi pi-minus text-surface-500 dark:text-white/64 opacity-64" />
                    <span v-else>{{ planIngredient }}</span>
                </div>
            </div>
        </div>
        <div
            class="lg:hidden bg-white/64 dark:bg-white/10 backdrop-blur-3xl p-6 rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)] dark:shadow-sm"
        >
            <div v-for="(item, index) of plans" :key="'plan-' + index">
                <div class="px-6 py-4 shadow-custom-shadow bg-surface-0 dark:bg-white/16 rounded-xl text-lg font-medium text-surface-950 dark:text-surface-0">
                    {{ item }}
                </div>
                <div class="flex items-center justify-between py-4 border-b border-surface-200 dark:border-white/10">
                    <div v-for="plan of planDetails" :key="plan.title" class="text-lg text-surface-950 dark:text-surface-0 text-center capitalize flex-1">
                        {{ plan.title }}
                    </div>
                </div>
                <div class="flex items-center justify-between py-4">
                    <div v-for="(_, j) of Array(4).fill(null)" :key="'planDetails-' + j" class="text-lg text-surface-950 dark:text-white/64 text-center flex-1">
                        <i v-if="planDetails[j].ingredients[index] === '_yes_'" class="pi pi-check" />
                        <i v-else-if="planDetails[j].ingredients[index] === '_no_'" class="pi pi-minus text-surface-500 dark:text-white/64 opacity-64" />
                        <span v-else>{{ planDetails[j].ingredients[index] }}</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
