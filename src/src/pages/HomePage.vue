<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Hoje</div>

    <div class="row q-gutter-md q-mb-lg">
      <q-card class="col" flat bordered>
        <q-card-section class="text-center">
          <div class="text-caption text-grey">Calorias</div>
          <div class="text-h5 text-primary">{{ Math.round(totals.energyKcal) }}</div>
          <div class="text-caption text-grey">kcal</div>
        </q-card-section>
      </q-card>
      <q-card class="col" flat bordered>
        <q-card-section class="text-center">
          <div class="text-caption text-grey">Proteína</div>
          <div class="text-h5 text-blue">{{ Math.round(totals.proteinG) }}g</div>
        </q-card-section>
      </q-card>
      <q-card class="col" flat bordered>
        <q-card-section class="text-center">
          <div class="text-caption text-grey">Carbos</div>
          <div class="text-h5 text-orange">{{ Math.round(totals.carbohydrateG) }}g</div>
        </q-card-section>
      </q-card>
      <q-card class="col" flat bordered>
        <q-card-section class="text-center">
          <div class="text-caption text-grey">Gordura</div>
          <div class="text-h5 text-red">{{ Math.round(totals.lipidG) }}g</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="text-h6 q-mb-sm">Refeições</div>

    <q-list v-if="mealEntries.length" bordered separator class="rounded-borders">
      <q-item v-for="group in groupedEntries" :key="group.mealType">
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ group.mealType }}</q-item-label>
          <q-item-label v-for="entry in group.entries" :key="entry.id" caption>
            {{ entry.expand?.food?.description || 'Alimento' }} — {{ entry.quantity_g }}g ({{ Math.round(entry.energy_kcal) }} kcal)
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat round icon="delete" color="negative" size="sm" @click="deleteEntry(group.entries[0].id)" />
        </q-item-section>
      </q-item>
    </q-list>

    <div v-else class="text-grey text-center q-pa-xl">
      <q-icon name="restaurant" size="48px" class="q-mb-md" />
      <div>Nenhuma refeição registrada hoje</div>
      <q-btn color="primary" label="Adicionar refeição" @click="openAddMealModal" class="q-mt-md" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { pocketbaseClient } from '@/boot/pocketbase'
import { useQuasar } from 'quasar'
import { useAddMealModal } from '@/composables/useAddMealModal'

const $q = useQuasar()
const { openAddMealModal, mealSavedCount } = useAddMealModal()
const mealEntries = ref([])

const mealTypeOrder = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar']

const todayFilter = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startDate = start.toISOString().replace('T', ' ').slice(0, 19)
  const endDate = new Date(start.getTime() + 86400000).toISOString().replace('T', ' ').slice(0, 19)
  return `consumed_at >= "${startDate}" && consumed_at < "${endDate}"`
})

const totals = computed(() => {
  return mealEntries.value.reduce((acc, entry) => ({
    energyKcal: acc.energyKcal + (entry.energy_kcal || 0),
    proteinG: acc.proteinG + (entry.protein_g || 0),
    carbohydrateG: acc.carbohydrateG + (entry.carbohydrate_g || 0),
    lipidG: acc.lipidG + (entry.lipid_g || 0)
  }), { energyKcal: 0, proteinG: 0, carbohydrateG: 0, lipidG: 0 })
})

const groupedEntries = computed(() => {
  const groups = {}
  for (const entry of mealEntries.value) {
    const mealType = entry.meal_type || 'Outros'
    if (!groups[mealType]) {
      groups[mealType] = { mealType, entries: [] }
    }
    groups[mealType].entries.push(entry)
  }
  return Object.values(groups).sort((a, b) => {
    return mealTypeOrder.indexOf(a.mealType) - mealTypeOrder.indexOf(b.mealType)
  })
})

async function fetchMealEntries() {
  try {
    const result = await pocketbaseClient.collection('meal_entries').getFullList({
      filter: todayFilter.value,
      sort: 'consumed_at',
      expand: 'food'
    })
    mealEntries.value = result
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Erro ao carregar refeições' })
  }
}

async function deleteEntry(entryId) {
  try {
    await pocketbaseClient.collection('meal_entries').delete(entryId)
    mealEntries.value = mealEntries.value.filter(e => e.id !== entryId)
    $q.notify({ type: 'positive', message: 'Entrada removida' })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Erro ao remover entrada' })
  }
}

onMounted(fetchMealEntries)

watch(mealSavedCount, fetchMealEntries)
</script>
