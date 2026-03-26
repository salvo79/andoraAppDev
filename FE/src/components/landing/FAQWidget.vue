<script setup>
import { ref } from 'vue';

const faqs = ref([
    {
        question: 'How do I become a webmaster?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    },
    {
        question: 'What is web traffic?',
        answer: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.'
    },
    {
        question: 'What is an easy way to make a website?',
        answer: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam.'
    },
    {
        question: 'How do you know if something is true?',
        answer: 'Cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.'
    }
]);
</script>

<template>
    <section class="py-12 lg:py-24 landing-container max-w-[60rem] mx-auto">
        <h3 class="text-5xl font-semibold text-surface-950 dark:text-surface-0 text-center">Frequently<br />Asked Questions</h3>
        <p class="mt-8 text-center text-surface-500 text-xl max-w-xl mx-auto">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <div class="mt-14">
            <Accordion :value="0" expandIcon="pi pi-plus" collapseIcon="pi pi-minus" class="space-y-4">
                <AccordionPanel
                    v-for="(faq, index) in faqs"
                    :key="index"
                    :value="index"
                    :pt="{
                        root: {
                            class: 'border! border-surface dark:border-white/10! bg-white/64! dark:bg-white/10! rounded-3xl shadow-[0px_10px_10px_-8px_rgba(18,18,23,0.02),0px_2px_2px_-1.5px_rgba(18,18,23,0.02),0px_1px_1px_-0.5px_rgba(18,18,23,0.02),0px_0px_0px_1px_rgba(18,18,23,0.02)]'
                        }
                    }"
                >
                    <AccordionHeader
                        :pt="{
                            root: {
                                class: 'p-6! bg-transparent! transition-all! data-[p-active=true]:pb-4! transition-all! duration-200!'
                            },
                            toggleIcon: {
                                class: 'text-lg! text-surface-950! dark:text-surface-0!'
                            }
                        }"
                    >
                        <h5 class="font-medium text-xl">{{ faq.question }}</h5>
                    </AccordionHeader>
                    <AccordionContent
                        :pt="{
                            content: {
                                class: 'px-6! pb-6! bg-transparent!'
                            }
                        }"
                    >
                        <p class="m-0 text-left text-surface-500 dark:text-white/64!">{{ faq.answer }}</p>
                    </AccordionContent>
                </AccordionPanel>
            </Accordion>
        </div>
    </section>
</template>
