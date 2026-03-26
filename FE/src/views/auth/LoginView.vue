<!-- LoginView.vue -->
<script setup>
import AppleWidget from '@/components/auth/AppleWidget.vue'
import AuthLogoWidget from '@/components/auth/AuthLogoWidget.vue'
import GoogleWidget from '@/components/auth/GoogleWidget.vue'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

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

/* ===============================
   LOGIN
================================ */
const login = async () => {

  loading.value = true
  errorMessage.value = ''

  try {

    const response = await axios.post('/api/auth/login', {
      username: username.value,
      password: password.value
    })
  

    const token = response.data.token

    localStorage.setItem("token", token)

    axios.defaults.headers.common["Authorization"] =
      `Bearer ${token}`

    const auth = useAuthStore()
    //auth.loadSession()


auth.user = response.data.username
auth.isAuthenticated = true
auth.token = token


//console.log(auth.isAuthenticated)


    toast.add({
      severity: 'success',
      summary: 'Login successful',
      detail: `Welcome ${response.data.username}`,
      life: 3000
    })
  console.log('Estoy aqui')
    router.push({ name: 'dashboard-marketing' })

  } catch (error) {

    errorMessage.value = "Invalid username or password"

  } finally {
    loading.value = false
  }
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
@submit.prevent="login"
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

<div class="flex flex-col gap-2">

<label for="username" class="font-medium text-surface-500 dark:text-white/64">
Usar Name
</label>

<InputText
ref="usernameInput"
id="username"
v-model="username"
class="w-full"
/>

</div>

<div class="flex flex-col gap-2">

<label for="password" class="font-medium text-surface-500 dark:text-white/64">
Password
</label>

<Password
id="password"
v-model="password"
toggleMask
:feedback="false"
class="w-full"
inputClass="w-full"
/>

</div>

<p
v-if="errorMessage"
class="text-red-500 text-sm text-center mt-2"
>
{{ errorMessage }}
</p>

<div class="flex items-center justify-between">

<div class="flex items-center gap-2">

<Checkbox
id="remember"
v-model="remember"
binary
/>

<label
for="remember"
class="text-surface-500 dark:text-white/64"
>
Remember me
</label>

</div>

<a
href=""
class="font-semibold text-primary"
>
Forgot password?
</a>

</div>

<Button
type="submit"
:loading="loading"
class="w-full"
rounded
>
Login
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