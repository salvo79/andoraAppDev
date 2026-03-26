
<!-- RegisterView.vue -->
<script setup>
import { ref, computed, watch } from 'vue';
import AppleWidget from '@/components/auth/AppleWidget.vue';
import AuthLogoWidget from '@/components/auth/AuthLogoWidget.vue';
import GoogleWidget from '@/components/auth/GoogleWidget.vue';
import api from '@/service/api';
import { useRouter } from 'vue-router';

// PrimeVue components
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

const username = ref('');
const email = ref('');
const password = ref('');
const checkbox = ref(false);
const passwordError = ref('');
const showPassword = ref(false);

const loading = ref(false);
const registerMessage = ref('');
const registerError = ref('');

const router = useRouter();



//Valida si existe previamente el usuario
watch(username, async (val) => {
  if (!val) return;

  try {
    const res = await api.get(`/auth/exists/${val}`);
    if (res.data.exists) {
      registerError.value = "Username already exists";
    } else {
      registerError.value = "";
    }
  } catch (e) {}
});


// Validación de password
const validatePassword = () => {
  const pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
  if (!pattern.test(password.value)) {
    passwordError.value = 'Password must be at least 8 characters and include letters, numbers, and symbols.';
    return false;
  }
  passwordError.value = '';
  return true;
};

// Validación de email básica
const validateEmail = () => {
  return email.value.includes('@');
};

// Computed para habilitar el botón
const isFormValid = computed(() => {
  return (
    username.value.trim() !== '' &&
    validateEmail() &&
    validatePassword() &&
    checkbox.value
  );
});

// Validación en tiempo real mientras escribe la contraseña
watch(password, () => validatePassword());

// Toggle de visibilidad de contraseña
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Función de registro con llamada al backend
const handleRegister = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  registerMessage.value = '';
  registerError.value = '';

  try {
    const response = await api.post('/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value
    });

    registerMessage.value = response.data.message || 'User registered successfully!';

    // 🧼 Limpiar formulario
    username.value = '';
    email.value = '';
    password.value = '';
    checkbox.value = false;

    // 🚀 REDIRECCIÓN (con pequeño delay para UX)
    setTimeout(() => {
      router.push('/landing/login');
    }, 1200);

  } catch (error) {
    if (error.response && error.response.data) {
      registerError.value = error.response.data.message || error.response.data;
    } else {
      registerError.value = 'Error registering user';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section class="animate-fadein animate-duration-300 animate-ease-in relative lg:pb-14 lg:py-52 py-36">
    <div class="landing-container mx-auto relative z-10 px-12">
      <div class="relative mt-28 max-w-[46rem] mx-auto">
        <div
          class="w-full h-full inset-0 bg-white/64 dark:bg-surface-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[4deg] lg:rotate-[7deg] backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)] dark:shadow-sm"
        />
        <form
          class="space-y-8 p-8 relative z-10 bg-white/64 dark:bg-surface-800 backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)]"
          @submit.prevent="handleRegister"
        >
          <div class="pt-8 pb-8">
            <div class="flex items-center justify-center">
              <AuthLogoWidget />
            </div>
            <h1 class="text-4xl lg:text-6xl font-semibold text-surface-950 dark:text-surface-0 text-center">Register</h1>
            <p class="text-center lg:text-xl text-surface-500 mt-6">Enter your details to create a new account.</p>
          </div>

          <!-- Campos -->
          <div class="flex flex-col gap-2">
            <label for="username" class="font-medium text-surface-500 dark:text-white/64">User Name</label>
            <InputText id="username" v-model="username" class="w-full" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="email" class="font-medium text-surface-500 dark:text-white/64">Email Address</label>
            <InputText id="email" v-model="email" class="w-full" />
          </div>

          <div class="flex flex-col gap-2 relative">
            <label for="password" class="font-medium text-surface-500 dark:text-white/64">Password</label>
            <!-- <InputText
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              class="w-full"
            />-->


            <Password
            id="password"
            v-model="password"
            toggleMask
            :feedback="false"
            class="w-full"
            inputClass="w-full"
            />

            <span v-if="passwordError" class="text-red-600 text-sm">{{ passwordError }}</span>
          </div>

          <div class="flex items-center gap-2">
            <Checkbox id="terms" v-model="checkbox" binary />
            <label for="terms" class="text-surface-500 dark:text-white/64">
              <span class="text-surface-950 dark:text-surface-0 font-medium">I have read the </span>Terms and Conditions
            </label>
          </div>

          <!-- Botón con spinner -->
<Button
  type="submit"
  class="w-full"
  rounded
  :disabled="!isFormValid || loading"
  :loading="loading"
>
  Register
</Button>

          <!-- Mensajes -->
          <div v-if="registerMessage" class="text-green-600 mt-2">
              {{ registerMessage }}
              <div class="mt-2">
                <a href="/landing/login" class="text-primary font-semibold">
                  Go to Login →
                </a>
              </div>
            </div>
          <div v-if="registerError" class="text-red-600 mt-2">{{ registerError }}</div>

          <div class="flex items-center justify-center gap-2 mt-4">
            <span class="text-surface-500 dark:text-white/64">Already have an account?</span>
            <a href="/landing/login" class="text-primary">Login</a>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>