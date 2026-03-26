<!-- VerifyEmailView.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthLogoWidget from '@/components/auth/AuthLogoWidget.vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import api from '@/service/api';

const route  = useRoute();
const router = useRouter();

const status        = ref('');
const loading       = ref(false);
const resendEmail   = ref('');
const resendMessage = ref('');
const resendError   = ref('');
const resendSuccess = ref(false);
const showCheck     = ref(false);
const countdown     = ref(0);
const canResend     = ref(true);
let timer = null;

function startCountdown(seconds = 60) {
  canResend.value = false;
  countdown.value = seconds;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      countdown.value = 0;
      canResend.value  = true;
    }
  }, 1000);
}

onUnmounted(() => clearInterval(timer));

onMounted(async () => {
  const token       = route.query.token;
  const statusParam = route.query.status;

  // Caso A: backend redirigió con ?status=success|invalid|expired
  if (statusParam) {
    status.value = statusParam;
    if (statusParam === 'success') {
      setTimeout(() => { showCheck.value = true; }, 150);
    }
    return;
  }

  // Caso B: enlace del correo apunta directo al frontend con ?token=xxx
  if (token) {
    status.value = 'loading';
    try {
      await api.get(`/auth/verify?token=${token}`);
      status.value = 'success';
      setTimeout(() => { showCheck.value = true; }, 150);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      status.value = msg.toLowerCase().includes('expir') ? 'expired' : 'invalid';
    }
    return;
  }

  // Caso C: sin token ni status
  status.value = 'invalid';
});

const handleResend = async () => {
  if (!resendEmail.value.includes('@')) {
    resendError.value = 'Enter a valid email address.';
    return;
  }
  loading.value       = true;
  resendError.value   = '';
  resendMessage.value = '';
  try {
    const res = await api.post('/auth/resend-verification', { email: resendEmail.value });
    resendMessage.value = res.data.message || 'Verification email sent!';
    resendSuccess.value = true;
    startCountdown(60);
  } catch (err) {
    resendError.value = err.response?.data?.message || 'Could not resend. Try again.';
    startCountdown(30);
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => router.push('/landing/login');
</script>

<template>
  <section class="animate-fadein animate-duration-300 animate-ease-in relative lg:pb-14 lg:py-52 py-36">
    <div class="landing-container mx-auto relative z-10 px-12">
      <div class="relative mt-28 max-w-[46rem] mx-auto">

        <div
          class="w-full h-full inset-0 bg-white/64 dark:bg-surface-800 absolute top-1/2 left-1/2
                 -translate-x-1/2 -translate-y-1/2 rotate-[4deg] lg:rotate-[7deg]
                 backdrop-blur-[90px] rounded-3xl
                 shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),
                         0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),
                         0px_3px_8px_0px_rgba(120,149,206,0.06)]
                 dark:shadow-sm"
        />

        <div
          class="space-y-8 p-8 relative z-10 bg-white/64 dark:bg-surface-800
                 backdrop-blur-[90px] rounded-3xl
                 shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),
                         0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),
                         0px_3px_8px_0px_rgba(120,149,206,0.06)]"
        >
          <div class="pt-8 pb-4 flex items-center justify-center">
            <AuthLogoWidget />
          </div>

          <!-- CARGANDO -->
          <template v-if="status === '' || status === 'loading'">
            <div class="flex flex-col items-center gap-6 py-8">
              <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: var(--p-primary-color);" />
              <p class="text-center lg:text-xl text-surface-500">Verifying your account…</p>
            </div>
          </template>

          <!-- ÉXITO -->
          <template v-else-if="status === 'success'">
            <div class="flex justify-center">
              <div class="check-wrapper" :class="{ active: showCheck }">
                <svg class="check-svg" viewBox="0 0 52 52">
                  <circle class="check-circle" cx="26" cy="26" r="24" fill="none" />
                  <path   class="check-mark"   fill="none" d="M14 27 l8 8 l16-16" />
                </svg>
              </div>
            </div>
            <div class="text-center space-y-3 pb-2">
              <h1 class="text-4xl lg:text-5xl font-semibold text-surface-950 dark:text-surface-0">
                Account activated!
              </h1>
              <p class="text-center lg:text-xl text-surface-500">
                Your AnDora account is ready. You can now sign in.
              </p>
            </div>
            <Button class="w-full" rounded @click="goToLogin">Go to Login</Button>
          </template>

          <!-- INVÁLIDO / EXPIRADO -->
          <template v-else-if="status === 'invalid' || status === 'expired'">
            <div class="flex justify-center">
              <div class="error-icon">
                <i class="pi pi-times-circle" style="font-size: 3.5rem; color: var(--p-red-400);" />
              </div>
            </div>
            <div class="text-center space-y-3 pb-2">
              <h1 class="text-4xl lg:text-5xl font-semibold text-surface-950 dark:text-surface-0">
                {{ status === 'expired' ? 'Link expired' : 'Invalid link' }}
              </h1>
              <p class="text-center lg:text-xl text-surface-500">
                {{ status === 'expired'
                  ? 'This verification link has expired. Request a new one below.'
                  : 'This link is not valid or has already been used.' }}
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <label for="resend-email" class="font-medium text-surface-500 dark:text-white/64">
                Email Address
              </label>
              <InputText
                id="resend-email"
                v-model="resendEmail"
                class="w-full"
                placeholder="Enter your registered email"
                :disabled="resendSuccess"
              />
            </div>

            <Button
              class="w-full" rounded
              :disabled="!canResend || loading || !resendEmail"
              :loading="loading"
              @click="handleResend"
            >
              <span v-if="countdown > 0">Resend in {{ countdown }}s</span>
              <span v-else-if="resendSuccess">Email sent — check your inbox</span>
              <span v-else>Resend verification email</span>
            </Button>

            <p v-if="resendMessage" class="text-green-600 text-center text-sm">{{ resendMessage }}</p>
            <p v-if="resendError"   class="text-red-500 text-center text-sm">{{ resendError }}</p>

            <div class="flex items-center gap-3">
              <div class="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
              <span class="text-surface-400 text-sm">or</span>
              <div class="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
            </div>

            <Button class="w-full" rounded severity="secondary" outlined @click="goToLogin">
              Back to Login
            </Button>
          </template>

          <div class="flex items-center justify-center gap-2 pb-4">
            <span class="text-surface-500 dark:text-white/64">Already verified?</span>
            <a href="/landing/login" class="text-primary">Login</a>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.check-wrapper { width: 80px; height: 80px; }
.check-svg     { width: 80px; height: 80px; }
.check-circle {
  stroke: var(--p-green-500, #22c55e);
  stroke-width: 2.5;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.65, 0, 0.45, 1);
}
.check-mark {
  stroke: var(--p-green-500, #22c55e);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  transition: stroke-dashoffset 0.4s 0.5s cubic-bezier(0.65, 0, 0.45, 1);
}
.check-wrapper.active .check-circle { stroke-dashoffset: 0; }
.check-wrapper.active .check-mark   { stroke-dashoffset: 0; }
.error-icon { animation: bounce-in 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
@keyframes bounce-in {
  0%   { transform: scale(0.3); opacity: 0; }
  50%  { transform: scale(1.1); opacity: 1; }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}
</style>