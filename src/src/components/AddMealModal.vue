<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 400px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Adicionar refeição</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-select
          v-model="selectedMealType"
          :options="mealTypeOptions"
          label="Tipo de refeição"
          filled
          class="q-mb-md"
          :rules="[(val) => !!val || 'Selecione o tipo']"
        />

        <q-input
          v-model="searchQuery"
          label="Buscar alimento"
          filled
          debounce="300"
          @update:model-value="onSearch"
          clearable
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-list
          v-if="searchResults.length"
          bordered
          separator
          class="rounded-borders q-mt-md"
          style="max-height: 200px; overflow-y: auto"
        >
          <q-item
            v-for="food in searchResults"
            :key="food.id"
            clickable
            v-ripple
            @click="selectFood(food)"
          >
            <q-item-section>
              <q-item-label>{{ food.description }}</q-item-label>
              <q-item-label caption>
                {{ food.category }} · {{ food.energy_kcal }} kcal/100g
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="selectedFood" class="q-mt-md">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle1 q-mb-sm">{{ selectedFood.description }}</div>
            <q-input
              v-model.number="quantityGrams"
              type="number"
              label="Quantidade (gramas)"
              filled
              :rules="[(val) => val > 0 || 'Informe a quantidade']"
            />
            <div class="q-mt-sm text-caption text-grey">
              {{ Math.round((selectedFood.energy_kcal * quantityGrams) / 100) }} kcal · P:
              {{ Math.round((selectedFood.protein_g * quantityGrams) / 100) }}g · C:
              {{ Math.round((selectedFood.carbohydrate_g * quantityGrams) / 100) }}g · G:
              {{ Math.round((selectedFood.lipid_g * quantityGrams) / 100) }}g
            </div>
            <div class="q-mt-sm row q-gutter-sm">
              <q-btn
                label="Adicionar à lista"
                color="primary"
                :disable="quantityGrams <= 0"
                @click="addToMealList"
              />
              <q-btn label="Cancelar" flat color="grey" @click="clearSelection" />
            </div>
          </q-card>
        </div>

        <div v-if="mealItems.length" class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">Alimentos na refeição</div>
          <q-list bordered separator class="rounded-borders">
            <q-item v-for="(item, index) in mealItems" :key="index">
              <q-item-section>
                <q-item-label>{{ item.food.description }}</q-item-label>
                <q-item-label caption>
                  {{ item.quantityGrams }}g ·
                  {{ Math.round((item.food.energy_kcal * item.quantityGrams) / 100) }} kcal
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center q-gutter-sm">
                  <q-input
                    v-model.number="item.quantityGrams"
                    type="number"
                    dense
                    outlined
                    style="width: 90px"
                    suffix="g"
                    :rules="[(val) => val > 0 || '']"
                  />
                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="removeItem(index)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn label="Cancelar" flat v-close-popup />
          <q-btn
            type="submit"
            label="Salvar refeição"
            color="primary"
            :disable="!mealItems.length || !selectedMealType"
            @click="onSubmit"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { pocketbaseClient } from '@/boot/pocketbase'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'saved'])

const mealTypeOptions = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar']
const selectedMealType = ref('')
const searchQuery = ref('')
const searchResults = ref([])
const selectedFood = ref(null)
const quantityGrams = ref(100)
const mealItems = ref([])

const dialogVisible = ref(false)

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) resetForm()
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) resetForm()
})

function resetForm() {
  selectedMealType.value = ''
  searchQuery.value = ''
  searchResults.value = []
  selectedFood.value = null
  quantityGrams.value = 100
  mealItems.value = []
}

async function onSearch(query) {
  if (!query || query.length < 2) {
    searchResults.value = []
    return
  }
  try {
    const response = await fetch(
      `http://127.0.0.1:8090/api/foods/search?q=${encodeURIComponent(query)}`
    )
    if (!response.ok) throw new Error('Search failed')
    const data = await response.json()
    searchResults.value = data.items
  } catch (error) {
    searchResults.value = []
  }
}

function selectFood(food) {
  selectedFood.value = food
  searchQuery.value = ''
  searchResults.value = []
}

function clearSelection() {
  selectedFood.value = null
  quantityGrams.value = 100
}

function addToMealList() {
  if (!selectedFood.value || quantityGrams.value <= 0) return

  if (mealItems.value.length >= 5) {
    $q.notify({
      color: 'warning',
      message: 'Limite de 5 alimentos por refeição',
      icon: 'warning'
    })
    return
  }

  mealItems.value.push({
    food: selectedFood.value,
    quantityGrams: quantityGrams.value
  })

  selectedFood.value = null
  quantityGrams.value = 100
  searchQuery.value = ''
  searchResults.value = []
}

function removeItem(index) {
  mealItems.value.splice(index, 1)
}

async function onSubmit() {
  if (!mealItems.value.length || !selectedMealType.value) return

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

  try {
    for (const item of mealItems.value) {
      const factor = item.quantityGrams / 100
      await pocketbaseClient.collection('meal_entries').create({
        food: item.food.id,
        quantity_g: item.quantityGrams,
        meal_type: selectedMealType.value,
        consumed_at: now,
        energy_kcal: item.food.energy_kcal * factor,
        protein_g: item.food.protein_g * factor,
        carbohydrate_g: item.food.carbohydrate_g * factor,
        lipid_g: item.food.lipid_g * factor,
        fiber_g: item.food.fiber_g * factor
      })
    }
    $q.notify({ type: 'positive', message: 'Refeição adicionada!' })
    emit('saved')
    dialogVisible.value = false
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Erro ao salvar refeição' })
  }
}
</script>
