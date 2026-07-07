<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round icon="arrow_back" @click="$router.back()" v-if="$route.path !== '/'" />
        <q-toolbar-title>
          <q-icon name="restaurant" class="q-mr-sm" />
          NutriVibe
        </q-toolbar-title>
        <q-btn flat round icon="add" @click="openAddMealModal" />
      </q-toolbar>
    </q-header>

    <q-footer elevated>
      <q-tabs>
        <q-route-tab icon="home" to="/" label="Hoje" />
        <q-route-tab icon="history" to="/history" label="Histórico" />
        <q-route-tab icon="bar_chart" to="/charts" label="Gráficos" />
      </q-tabs>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <AddMealModal v-model="addMealModalOpen" @saved="onMealSaved" />
  </q-layout>
</template>

<script setup>
import { useAddMealModal } from "@/composables/useAddMealModal";
import AddMealModal from "@/components/AddMealModal.vue";

const { addMealModalOpen, openAddMealModal, notifySaved } = useAddMealModal();

function onMealSaved() {
  notifySaved();
}
</script>
