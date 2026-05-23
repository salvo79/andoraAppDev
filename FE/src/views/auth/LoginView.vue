<!-- LoginView.vue -->
<script setup>
import AppleWidget from '@/components/auth/AppleWidget.vue'
import AuthLogoWidget from '@/components/auth/AuthLogoWidget.vue'
import GoogleWidget from '@/components/auth/GoogleWidget.vue'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/service/api'

import { useAuthStore } from '@/stores/authStore'

import Password from 'primevue/password'

const toast = useToast()
const router = useRouter()

const usernameInput = ref(null)

const remember = ref(false)
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

// 2FA step
const twoFactorRequired = ref(false)
const twoFactorUsername = ref('')
const twoFactorCode = ref('')

/* ===============================
   LOGIN
================================ */
const login = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.post('/auth/login', {
      username: username.value,
      password: password.value
    })

    if (response.data.requiresTwoFactor) {
      twoFactorUsername.value = response.data.username
      twoFactorRequired.value = true
      return
    }

    await finalizeLogin(response.data)

  } catch (error) {
    errorMessage.value = "Invalid username or password"
  } finally {
    loading.value = false
  }
}

/* ===============================
   VERIFY 2FA CODE
================================ */
const verifyTwoFactor = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.post('/auth/2fa/verify', {
      username: twoFactorUsername.value,
      code: twoFactorCode.value
    })

    await finalizeLogin(response.data)

  } catch {
    errorMessage.value = "Invalid or expired code"
  } finally {
    loading.value = false
  }
}

/* ===============================
   FINALIZE LOGIN (shared)
================================ */
const finalizeLogin = async (data) => {
  localStorage.setItem('token', data.token)

  const auth = useAuthStore()
  auth.user = data.username
  auth.isAuthenticated = true

  try {
    const profile = await api.get('/profile')
    if (profile.data.profilePhoto) auth.setProfilePhoto(profile.data.profilePhoto)
  } catch { /* no photo yet */ }

  toast.add({ severity: 'success', summary: 'Login successful', detail: `Welcome ${data.username}`, life: 3000 })
  router.push({ name: 'dashboard-marketing' })
}

/* ===============================
   AUTOFOCUS
================================ */
onMounted(() => {
  usernameInput.value?.$el?.focus?.()
})

</script>

<template>
<section class="animate-fadein animate-duration-300 animate-ease-in relative lg:pb-14 lg:py-52 py-36">
<div class="landing-container mx-auto relative z-10 px-12">
<div class="relative mt-28 max-w-[46rem] mx-auto">

<div
class="w-full h-full inset-0 bg-white/64 dark:bg-surface-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[4deg] lg:rotate-[7deg] backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)] dark:shadow-sm"
/>

<div
class="w-full h-full inset-0 bg-white/64 dark:bg-surface-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[4deg] lg:-rotate-[7deg] backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)] dark:shadow-sm"
/>

<form
@submit.prevent="twoFactorRequired ? verifyTwoFactor() : login()"
class="space-y-8 p-8 relative z-10 bg-white/64 dark:bg-surface-800 backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)]"
>

<div class="pt-8 pb-8">

<div class="flex items-center justify-center">
<AuthLogoWidget />
</div>

<h1 class="text-4xl lg:text-6xl font-semibold text-surface-950 dark:text-surface-0 text-center">
Login
</h1>

<p class="text-center lg:text-xl text-surface-500 dark:text-white/64 mt-6 max-w-sm mx-auto">
Enter your username and password to access your account.
</p>

</div>

<!-- Step 1: username + password -->
<template v-if="!twoFactorRequired">
<div class="flex flex-col gap-2">
<label for="username" class="font-medium text-surface-500 dark:text-white/64">User Name</label>
<InputText ref="usernameInput" id="username" v-model="username" class="w-full" />
</div>

<div class="flex flex-col gap-2">
<label for="password" class="font-medium text-surface-500 dark:text-white/64">Password</label>
<Password id="password" v-model="password" toggleMask :feedback="false" class="w-full" inputClass="w-full" />
</div>
</template>

<!-- Step 2: 2FA code -->
<template v-else>
<div class="flex flex-col items-center gap-4 py-4">
  <i class="pi pi-shield text-5xl text-primary" />
  <p class="text-center text-surface-500 dark:text-white/64">
    Enter the 6-digit code from your Google Authenticator app.
  </p>
  <InputOtp v-model="twoFactorCode" :length="6" integerOnly class="justify-center" />
</div>
</template>

<p
v-if="errorMessage"
class="text-red-500 text-sm text-center mt-2"
>
{{ errorMessage }}
</p>

<div v-if="!twoFactorRequired" class="flex items-center justify-between">
<div class="flex items-center gap-2">
<Checkbox id="remember" v-model="remember" binary />
<label for="remember" class="text-surface-500 dark:text-white/64">Remember me</label>
</div>
<a href="" class="font-semibold text-primary">Forgot password?</a>
</div>

<Button type="submit" :loading="loading" class="w-full" rounded>
{{ twoFactorRequired ? 'Verify Code' : 'Login' }}
</Button>

<div class="flex items-center justify-center gap-2">

<span class="text-surface-500 dark:text-white/64">
Not registered?
</span>

<router-link
to="/landing/register"
class="text-primary"
>
Create an Account
</router-link>

</div>

</form>
</div>
</div>
</section>
</template>