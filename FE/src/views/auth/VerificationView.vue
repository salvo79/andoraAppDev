<script setup>
import AuthLogoWidget from '@/components/auth/AuthLogoWidget.vue';
import { ref } from 'vue';

const value = ref('');
</script>

<template>
    <section class="animate-fadein animate-duration-300 animate-ease-in relative lg:pb-14 lg:py-52 py-36">
        <div class="landing-container mx-auto relative z-10 px-12">
            <div class="relative mt-28 max-w-[36rem] mx-auto">
                <div
                    class="w-full h-full inset-0 bg-white/64 dark:bg-surface-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[4deg] lg:rotate-[7deg] backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)] dark:shadow-sm"
                />
                <div
                    class="w-full h-full inset-0 bg-white/64 dark:bg-surface-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[4deg] lg:-rotate-[7deg] backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)] dark:shadow-sm"
                />
                <form
                    class="p-8 relative z-10 bg-white/64 dark:bg-surface-800 backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)]"
                >
                    <div class="pt-8 pb-8">
                        <div class="flex items-center justify-center">
                            <AuthLogoWidget />
                        </div>
                        <h1 class="text-4xl lg:text-6xl font-semibold text-surface-950 dark:text-surface-0 text-center">Verification</h1>
                        <p class="text-center lg:text-xl text-surface-500 mt-6">Please verify your account.</p>
                    </div>
                    <div class="flex flex-col items-center">
                        <InputOtp v-model="value" :length="6" style="gap: 0">
                            <template #default="{ attrs, events, index }">
                                <InputText v-bind="attrs" v-on="events" class="custom-otp-input" />
                                <div v-if="index === 3" class="px-4">
                                    <i class="pi pi-minus" />
                                </div>
                            </template>
                        </InputOtp>
                    </div>
                    <div class="flex items-center gap-4 mt-8">
                        <button class="button flex-1">Cancel</button>
                        <button class="button-primary flex-1">Verify</button>
                    </div>
                </form>
            </div>
        </div>
    </section>
</template>

<style scoped>
.custom-otp-input {
    width: 48px;
    height: 48px;
    font-size: 24px;
    appearance: none;
    text-align: center;
    transition: all 0.2s;
    border-radius: 0;
    border: 1px solid var(--p-inputtext-border-color);
    background: transparent;
    outline-offset: -2px;
    outline-color: transparent;
    border-right: 0 none;
    transition: outline-color 0.3s;
    color: var(--p-inputtext-color);
}

.custom-otp-input:focus {
    outline: 2px solid var(--p-focus-ring-color);
}

.custom-otp-input:first-child,
.custom-otp-input:nth-child(5) {
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
}

.custom-otp-input:nth-child(3),
.custom-otp-input:last-child {
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
    border-right-width: 1px;
    border-right-style: solid;
    border-color: var(--p-inputtext-border-color);
}
</style>
