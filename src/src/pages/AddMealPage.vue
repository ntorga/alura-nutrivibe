<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Adicionar refeição</div>

    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-select
        v-model="selectedMealType"
        :options="mealTypeOptions"
        label="Tipo de refeição"
        filled
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

      <q-list v-if="searchResults.length" bordered separator class="rounded-borders q-mb-md">
        <q-item
          v-for="food in searchResults"
          :key="food.id"
          clickable
          v-ripple
          @click="selectFood(food)"
          :class="{ 'bg-blue-1': selectedFood && selectedFood.id === food.id }"
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
        </q-card>
      </div>

      <q-btn
        type="submit"
        label="Salvar"
        color="primary"
        :disable="!selectedFood || quantityGrams <= 0"
        class="full-width"
      />
    </q-form>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { pocketbaseClient } from "@/boot/pocketbase";
import { useQuasar } from "quasar";

const $q = useQuasar();
const router = useRouter();

const mealTypeOptions = ["Café da manhã", "Almoço", "Lanche", "Jantar"];
const selectedMealType = ref("");
const searchQuery = ref("");
const searchResults = ref([]);
const selectedFood = ref(null);
const quantityGrams = ref(100);

async function onSearch(query) {
  if (!query || query.length < 2) {
    searchResults.value = [];
    return;
  }
  try {
    const results = await pocketbaseClient.collection("foods").getList(1, 20, {
      filter: `description~"${query}"`,
      sort: "-energy_kcal",
    });
    searchResults.value = results.items;
  } catch (error) {
    searchResults.value = [];
  }
}

function selectFood(food) {
  selectedFood.value = food;
}

async function onSubmit() {
  if (!selectedFood.value || quantityGrams.value <= 0) return;

  const factor = quantityGrams.value / 100;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  try {
    await pocketbaseClient.collection("meal_entries").create({
      food: selectedFood.value.id,
      quantity_g: quantityGrams.value,
      meal_type: selectedMealType.value,
      consumed_at: now,
      energy_kcal: selectedFood.value.energy_kcal * factor,
      protein_g: selectedFood.value.protein_g * factor,
      carbohydrate_g: selectedFood.value.carbohydrate_g * factor,
      lipid_g: selectedFood.value.lipid_g * factor,
      fiber_g: selectedFood.value.fiber_g * factor,
    });
    $q.notify({ type: "positive", message: "Refeição adicionada!" });
    router.push("/");
  } catch (error) {
    $q.notify({ type: "negative", message: "Erro ao salvar refeição" });
  }
}
</script>
