<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="restaurant" class="q-mr-sm" />
          NutriVibe
        </q-toolbar-title>
        <q-btn flat round icon="add" @click="openAddMealModal" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <AddMealModal v-model="addMealModalOpen" @saved="onMealSaved" />
  </q-layout>
</template>

<script setup>
import { useAddMealModal } from '@/composables/useAddMealModal'
import AddMealModal from '@/components/AddMealModal.vue'

const { addMealModalOpen, openAddMealModal, notifySaved } = useAddMealModal()

function onMealSaved() {
  notifySaved()
}
</script>
