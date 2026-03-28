<!-- ProfileView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/service/api'
import { useAuthStore } from '@/stores/authStore'

const toast = useToast()
const auth = useAuthStore()

const profile = ref({ username: '', email: '', roles: [], createdAt: null, profilePhoto: null })
const loadingProfile = ref(true)

// Password form
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loadingPassword = ref(false)

// Email form
const newEmail = ref('')
const loadingEmail = ref(false)

// Photo
const photoPreview = ref(null)
const loadingPhoto = ref(false)
const fileInput = ref(null)

/* ===============================
   LOAD PROFILE
================================ */
onMounted(async () => {
  try {
    const res = await api.get('/profile')
    profile.value = res.data
    photoPreview.value = res.data.profilePhoto || null
    newEmail.value = res.data.email
    if (res.data.profilePhoto) auth.setProfilePhoto(res.data.profilePhoto)
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el perfil', life: 3000 })
  } finally {
    loadingProfile.value = false
  }
})

/* ===============================
   CHANGE PASSWORD
================================ */
const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    toast.add({ severity: 'warn', summary: 'Atención', detail: 'Las contraseñas no coinciden', life: 3000 })
    return
  }
  if (newPassword.value.length < 6) {
    toast.add({ severity: 'warn', summary: 'Atención', detail: 'La contraseña debe tener al menos 6 caracteres', life: 3000 })
    return
  }

  loadingPassword.value = true
  try {
    await api.put('/profile/password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })
    toast.add({ severity: 'success', summary: 'Listo', detail: 'Contraseña actualizada', life: 3000 })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    const msg = err.response?.data?.message || 'Error al cambiar la contraseña'
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 3000 })
  } finally {
    loadingPassword.value = false
  }
}

/* ===============================
   CHANGE EMAIL
================================ */
const changeEmail = async () => {
  if (!newEmail.value || !newEmail.value.includes('@')) {
    toast.add({ severity: 'warn', summary: 'Atención', detail: 'Ingresa un correo válido', life: 3000 })
    return
  }

  loadingEmail.value = true
  try {
    await api.put('/profile/email', { newEmail: newEmail.value })
    profile.value.email = newEmail.value
    toast.add({ severity: 'success', summary: 'Listo', detail: 'Correo actualizado', life: 3000 })
  } catch (err) {
    const msg = err.response?.data?.message || 'Error al cambiar el correo'
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 3000 })
  } finally {
    loadingEmail.value = false
  }
}

/* ===============================
   UPLOAD PHOTO
================================ */
const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    toast.add({ severity: 'warn', summary: 'Atención', detail: 'La imagen no puede superar 2MB', life: 3000 })
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const uploadPhoto = async () => {
  if (!photoPreview.value || photoPreview.value === profile.value.profilePhoto) {
    toast.add({ severity: 'warn', summary: 'Atención', detail: 'Selecciona una imagen primero', life: 3000 })
    return
  }

  loadingPhoto.value = true
  try {
    await api.put('/profile/photo', { photoBase64: photoPreview.value })
    profile.value.profilePhoto = photoPreview.value
    auth.setProfilePhoto(photoPreview.value)
    toast.add({ severity: 'success', summary: 'Listo', detail: 'Foto actualizada', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error al subir la foto', life: 3000 })
  } finally {
    loadingPhoto.value = false
  }
}
</script>

<template>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

  <!-- ===== FOTO Y DATOS ===== -->
  <div class="lg:col-span-1">
    <div class="card flex flex-col items-center gap-4 p-6">

      <!-- Avatar -->
      <div class="relative">
        <img
          v-if="photoPreview"
          :src="photoPreview"
          alt="Foto de perfil"
          class="w-32 h-32 rounded-full object-cover border-4 border-primary shadow"
        />
        <div
          v-else
          class="w-32 h-32 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center shadow"
        >
          <i class="pi pi-user text-5xl text-primary" />
        </div>

        <button
          class="absolute bottom-0 right-0 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-primary-600 transition"
          @click="fileInput.click()"
        >
          <i class="pi pi-camera text-sm" />
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileSelected"
      />

      <Button
        label="Guardar foto"
        icon="pi pi-upload"
        size="small"
        :loading="loadingPhoto"
        @click="uploadPhoto"
      />

      <!-- Info básica -->
      <div class="text-center mt-2">
        <p class="text-xl font-semibold text-surface-900 dark:text-surface-0">{{ profile.username }}</p>
        <p class="text-surface-500 dark:text-white/60 text-sm">{{ profile.email }}</p>
        <div class="flex gap-2 justify-center mt-2 flex-wrap">
          <Tag v-for="role in profile.roles" :key="role" :value="role" severity="info" />
        </div>
        <p class="text-xs text-surface-400 mt-3">
          Miembro desde {{ profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-' }}
        </p>
      </div>

    </div>
  </div>

  <!-- ===== FORMULARIOS ===== -->
  <div class="lg:col-span-2 flex flex-col gap-6">

    <!-- Cambiar email -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold mb-4">Correo electrónico</h3>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="font-medium text-surface-500 dark:text-white/64">Nuevo correo</label>
          <InputText v-model="newEmail" placeholder="correo@ejemplo.com" class="w-full" />
        </div>
        <Button
          label="Actualizar correo"
          icon="pi pi-envelope"
          :loading="loadingEmail"
          @click="changeEmail"
        />
      </div>
    </div>

    <!-- Cambiar contraseña -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold mb-4">Cambiar contraseña</h3>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="font-medium text-surface-500 dark:text-white/64">Contraseña actual</label>
          <Password v-model="currentPassword" toggleMask :feedback="false" class="w-full" inputClass="w-full" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="font-medium text-surface-500 dark:text-white/64">Nueva contraseña</label>
          <Password v-model="newPassword" toggleMask :feedback="true" class="w-full" inputClass="w-full" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="font-medium text-surface-500 dark:text-white/64">Confirmar nueva contraseña</label>
          <Password v-model="confirmPassword" toggleMask :feedback="false" class="w-full" inputClass="w-full" />
        </div>
        <Button
          label="Cambiar contraseña"
          icon="pi pi-lock"
          :loading="loadingPassword"
          @click="changePassword"
        />
      </div>
    </div>

  </div>
</div>
</template>
