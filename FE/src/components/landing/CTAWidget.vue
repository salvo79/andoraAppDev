<script setup>
import { useLayout } from '@/layout/composables/layout';
import LazyImageWidget from './LazyImageWidget.vue';
import PatternWidget from './PatternWidget.vue';

const { layoutConfig, isDarkTheme } = useLayout();
</script>

<template>
    <section class="my-24 landing-container">
        <div class="relative overflow-hidden pt-8 px-6 md:pt-20 h-[32rem] md:h-[44rem] dark:bg-white/12 rounded-3xl shadow-custom-shadow">
            <div class="relative z-20">
                <h2 class="text-center max-w-lg mx-auto text-4xl md:text-5xl font-semibold text-surface-950 dark:text-surface-0">Enhance Your Marketing Strategy</h2>
                <p class="mt-6 text-lg text-surface-500 dark:text-white/64 max-w-2xl text-center md:mx-auto">Utilize our comprehensive tools and insights to optimize your campaigns, increase engagement, and drive business growth.</p>
                <button class="button-primary mt-8 mx-auto">Get Started</button>
            </div>
            <LazyImageWidget
                :src="'/images/ecommerce-dashboard-' + (isDarkTheme ? 'noir-dark' : layoutConfig.primary) + '.png'"
                alt="CTA Dashboard Image"
                class="absolute top-[340px] sm:top-[320px] md:top-[412px] left-[32px] sm:left-[62px] md:left-[82px] z-10 w-[260px] md:w-[420px] h-auto rotate-[-15deg] drop-shadow-md"
            />
            <LazyImageWidget
                :src="'/images/marketing-dashboard-' + (isDarkTheme ? 'noir-dark' : layoutConfig.primary) + '.png'"
                alt="CTA Dashboard Image"
                class="absolute top-[300px] sm:top-[270px] md:top-[360px] lg:top-[335px] left-1/2 -translate-x-1/2 z-20 w-[240px] sm:w-[280px] md:w-[420px] lg:w-[500px] h-auto drop-shadow-lg"
            />
            <LazyImageWidget
                :src="'/images/banking-dashboard-' + (isDarkTheme ? 'noir-dark' : layoutConfig.primary) + '.png'"
                alt="CTA Dashboard Image"
                class="absolute top-[340px] sm:top-[320px] md:top-[412px] right-[32px] sm:right-[62px] md:right-[82px] z-10 w-[260px] md:w-[420px] h-auto rotate-[15deg] drop-shadow-md"
            />
            <PatternWidget />
        </div>
    </section>
</template>
