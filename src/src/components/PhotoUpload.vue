<template>
  <div class="photo-upload q-pa-md">
    <div class="row items-center q-gutter-md">
      <q-btn
        color="primary"
        icon="camera_alt"
        label="Tirar foto"
        @click="triggerCamera"
        :disable="isUploading"
      />
      <q-btn
        color="secondary"
        icon="photo_library"
        label="Escolher imagem"
        @click="triggerFilePicker"
        :disable="isUploading"
      />
      <input
        ref="cameraInput"
        type="file"
        accept="image/*"
        capture="environment"
        style="display: none"
        @change="handleFileSelected"
      />
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileSelected"
      />
    </div>

    <div v-if="imagePreview" class="q-mt-md">
      <q-img
        :src="imagePreview"
        style="max-width: 400px; max-height: 300px"
        fit="contain"
        class="rounded-borders"
      />
      <div class="q-mt-sm row q-gutter-sm">
        <q-btn
          color="positive"
          icon="auto_awesome"
          label="Reconhecer refeição"
          :loading="isUploading"
          @click="recognizeMeal"
        />
        <q-btn
          color="negative"
          flat
          icon="close"
          label="Remover"
          @click="clearImage"
          :disable="isUploading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const emit = defineEmits(['recognized', 'error'])

const cameraInput = ref(null)
const fileInput = ref(null)
const selectedFile = ref(null)
const imagePreview = ref(null)
const isUploading = ref(false)

function triggerCamera() {
  cameraInput.value.click()
}

function triggerFilePicker() {
  fileInput.value.click()
}

function handleFileSelected(event) {
  const file = event.target.files[0]
  if (!file) return

  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)

  event.target.value = ''
}

async function recognizeMeal() {
  if (!selectedFile.value) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('image', selectedFile.value)

    const fetchResponse = await fetch('/api/meals/parse', {
      method: 'POST',
      body: formData
    })

    if (!fetchResponse.ok) {
      const errorBody = await fetchResponse.json().catch(() => ({}))
      throw new Error(errorBody.message || 'Erro ao reconhecer refeição')
    }

    const responseData = await fetchResponse.json()
    emit('recognized', responseData)
    clearImage()
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error.message || 'Erro ao reconhecer refeição',
      icon: 'error'
    })
    emit('error', error)
  } finally {
    isUploading.value = false
  }
}

function clearImage() {
  selectedFile.value = null
  imagePreview.value = null
}
</script>

<style scoped>
.photo-upload {
  border: 2px dashed $grey-5;
  border-radius: 8px;
}
</style>
