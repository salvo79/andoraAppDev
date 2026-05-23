<!-- ProfileView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/service/api'
import { useAuthStore } from '@/stores/authStore'
import QRCode from 'qrcode'

const toast = useToast()
const auth = useAuthStore()

const profile = ref({ username: '', email: '', roles: [], createdAt: null, profilePhoto: null, twoFactorEnabled: false })
const loadingProfile = ref(true)

// 2FA
const twoFactorEnabled = ref(false)
const twoFactorSetupMode = ref(false)
const twoFactorQrUrl = ref('')
const twoFactorSecret = ref('')
const twoFactorCode = ref('')
const twoFactorDisableCode = ref('')
const loadingTwoFactor = ref(false)

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
const selectedFile = ref(null)
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
    twoFactorEnabled.value = res.data.twoFactorEnabled || false
    if (res.data.profilePhoto) auth.setProfilePhoto(res.data.profilePhoto)
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load profile', life: 3000 })
  } finally {
    loadingProfile.value = false
  }
})

/* ===============================
   CHANGE PASSWORD
================================ */
const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Passwords do not match', life: 3000 })
    return
  }
  if (newPassword.value.length < 6) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Password must be at least 6 characters', life: 3000 })
    return
  }

  loadingPassword.value = true
  try {
    await api.put('/profile/password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })
    toast.add({ severity: 'success', summary: 'Success', detail: 'Password updated', life: 3000 })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    const msg = err.response?.data?.message || 'Error updating password'
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
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter a valid email', life: 3000 })
    return
  }

  loadingEmail.value = true
  try {
    await api.put('/profile/email', { newEmail: newEmail.value })
    profile.value.email = newEmail.value
    toast.add({ severity: 'success', summary: 'Success', detail: 'Email updated', life: 3000 })
  } catch (err) {
    const msg = err.response?.data?.message || 'Error updating email'
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
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Image must not exceed 2MB', life: 3000 })
    return
  }

  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => { photoPreview.value = e.target.result }
  reader.readAsDataURL(file)
}

/* ===============================
   2FA SETUP
================================ */
const startTwoFactorSetup = async () => {
  loadingTwoFactor.value = true
  try {
    const res = await api.post('/profile/2fa/setup')
    twoFactorSecret.value = res.data.secret
    twoFactorQrUrl.value = await QRCode.toDataURL(res.data.uri, { width: 200 })
    twoFactorSetupMode.value = true
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not start 2FA setup', life: 3000 })
  } finally {
    loadingTwoFactor.value = false
  }
}

const enableTwoFactor = async () => {
  loadingTwoFactor.value = true
  try {
    await api.post('/profile/2fa/enable', { code: twoFactorCode.value })
    twoFactorEnabled.value = true
    twoFactorSetupMode.value = false
    twoFactorCode.value = ''
    toast.add({ severity: 'success', summary: '2FA Enabled', detail: 'Two-factor authentication is now active', life: 3000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Invalid code', life: 3000 })
  } finally {
    loadingTwoFactor.value = false
  }
}

const disableTwoFactor = async () => {
  loadingTwoFactor.value = true
  try {
    await api.delete('/profile/2fa', { data: { code: twoFactorDisableCode.value } })
    twoFactorEnabled.value = false
    twoFactorDisableCode.value = ''
    toast.add({ severity: 'success', summary: '2FA Disabled', detail: 'Two-factor authentication has been removed', life: 3000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Invalid code', life: 3000 })
  } finally {
    loadingTwoFactor.value = false
  }
}

const uploadPhoto = async () => {
  if (!selectedFile.value) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please select an image first', life: 3000 })
    return
  }

  const formData = new FormData()
  formData.append('photo', selectedFile.value)

  loadingPhoto.value = true
  try {
    const res = await api.put('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    profile.value.profilePhoto = res.data.profilePhoto
    auth.setProfilePhoto(res.data.profilePhoto)
    selectedFile.value = null
    toast.add({ severity: 'success', summary: 'Success', detail: 'Profile photo updated', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error uploading photo', life: 3000 })
  } finally {
    loadingPhoto.value = false
  }
}
</script>

<template>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

  <!-- ===== PHOTO & INFO ===== -->
  <div class="lg:col-span-1">
    <div class="card flex flex-col items-center gap-4 p-6">

      <!-- Avatar -->
      <div class="relative">
        <img
          v-if="photoPreview"
          :src="photoPreview"
          alt="Profile photo"
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
        label="Save photo"
        icon="pi pi-upload"
        size="small"
        :loading="loadingPhoto"
        @click="uploadPhoto"
      />

      <!-- Basic info -->
      <div class="text-center mt-2">
        <p class="text-xl font-semibold text-surface-900 dark:text-surface-0">{{ profile.username }}</p>
        <p class="text-surface-500 dark:text-white/60 text-sm">{{ profile.email }}</p>
        <div class="flex gap-2 justify-center mt-2 flex-wrap">
          <Tag v-for="role in profile.roles" :key="role" :value="role" severity="info" />
        </div>
        <p class="text-xs text-surface-400 mt-3">
          Member since {{ profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-' }}
        </p>
      </div>

    </div>
  </div>

  <!-- ===== FORMS ===== -->
  <div class="lg:col-span-2 flex flex-col gap-6">

    <!-- Change email -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold mb-4">Email address</h3>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="font-medium text-surface-500 dark:text-white/64">New email</label>
          <InputText v-model="newEmail" placeholder="email@example.com" class="w-full" />
        </div>
        <Button
          label="Update email"
          icon="pi pi-envelope"
          :loading="loadingEmail"
          @click="changeEmail"
        />
      </div>
    </div>

    <!-- Change password -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold mb-4">Change password</h3>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="font-medium text-surface-500 dark:text-white/64">Current password</label>
          <Password v-model="currentPassword" toggleMask :feedback="false" class="w-full" inputClass="w-full" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="font-medium text-surface-500 dark:text-white/64">New password</label>
          <Password v-model="newPassword" toggleMask :feedback="true" class="w-full" inputClass="w-full" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="font-medium text-surface-500 dark:text-white/64">Confirm new password</label>
          <Password v-model="confirmPassword" toggleMask :feedback="false" class="w-full" inputClass="w-full" />
        </div>
        <Button
          label="Change password"
          icon="pi pi-lock"
          :loading="loadingPassword"
          @click="changePassword"
        />
      </div>
    </div>

    <!-- Two-Factor Authentication -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold">Two-Factor Authentication</h3>
          <p class="text-sm text-surface-500 dark:text-white/60 mt-1">
            Add an extra layer of security using Google Authenticator.
          </p>
        </div>
        <Tag :value="twoFactorEnabled ? 'Active' : 'Inactive'" :severity="twoFactorEnabled ? 'success' : 'secondary'" />
      </div>

      <!-- Disabled: show setup button -->
      <div v-if="!twoFactorEnabled && !twoFactorSetupMode">
        <Button label="Enable 2FA" icon="pi pi-shield" :loading="loadingTwoFactor" @click="startTwoFactorSetup" />
      </div>

      <!-- Setup mode: show QR + confirm code -->
      <div v-if="twoFactorSetupMode" class="flex flex-col gap-4">
        <p class="text-sm text-surface-600 dark:text-white/70">
          1. Open <strong>Google Authenticator</strong> and scan this QR code.
        </p>
        <div class="flex justify-center">
          <img :src="twoFactorQrUrl" alt="QR Code" class="rounded-lg border border-surface-200" />
        </div>
        <p class="text-xs text-center text-surface-400">
          Or enter the key manually: <code class="font-mono bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded">{{ twoFactorSecret }}</code>
        </p>
        <p class="text-sm text-surface-600 dark:text-white/70">
          2. Enter the 6-digit code shown in the app to confirm.
        </p>
        <InputOtp v-model="twoFactorCode" :length="6" integerOnly class="justify-center" />
        <div class="flex gap-2">
          <Button label="Confirm & Enable" icon="pi pi-check" :loading="loadingTwoFactor" @click="enableTwoFactor" />
          <Button label="Cancel" severity="secondary" @click="twoFactorSetupMode = false" />
        </div>
      </div>

      <!-- Enabled: show disable section -->
      <div v-if="twoFactorEnabled" class="flex flex-col gap-3">
        <p class="text-sm text-surface-500 dark:text-white/60">
          To disable 2FA, enter your current authenticator code.
        </p>
        <InputOtp v-model="twoFactorDisableCode" :length="6" integerOnly class="justify-center" />
        <Button label="Disable 2FA" icon="pi pi-shield" severity="danger" :loading="loadingTwoFactor" @click="disableTwoFactor" />
      </div>
    </div>

  </div>
</div>
</template>
