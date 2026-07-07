<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 400px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ editEntry ? "Editar refeição" : "Adicionar refeição" }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
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

          <q-list v-if="searchResults.length" bordered separator class="rounded-borders">
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

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn label="Cancelar" flat v-close-popup />
            <q-btn
              type="submit"
              label="Salvar"
              color="primary"
              :disable="!selectedFood || quantityGrams <= 0"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { pocketbaseClient } from "@/boot/pocketbase";
import { useQuasar } from "quasar";

const $q = useQuasar();

const props = defineProps({
  modelValue: Boolean,
  editEntry: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "saved"]);

const mealTypeOptions = ["Café da manhã", "Almoço", "Lanche", "Jantar"];
const selectedMealType = ref("");
const searchQuery = ref("");
const searchResults = ref([]);
const selectedFood = ref(null);
const quantityGrams = ref(100);

const dialogVisible = ref(false);

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      if (props.editEntry) {
        loadEditEntry(props.editEntry);
      } else {
        resetForm();
      }
    }
  },
);

watch(dialogVisible, (val) => {
  emit("update:modelValue", val);
  if (!val) resetForm();
});

function resetForm() {
  selectedMealType.value = "";
  searchQuery.value = "";
  searchResults.value = [];
  selectedFood.value = null;
  quantityGrams.value = 100;
}

function loadEditEntry(entry) {
  selectedMealType.value = entry.meal_type || "";
  quantityGrams.value = entry.quantity_g || 100;
  if (entry.expand?.food) {
    selectedFood.value = entry.expand.food;
    searchQuery.value = entry.expand.food.description;
    searchResults.value = [entry.expand.food];
  } else if (entry.food) {
    pocketbaseClient
      .collection("foods")
      .getOne(entry.food)
      .then((food) => {
        selectedFood.value = food;
        searchQuery.value = food.description;
        searchResults.value = [food];
      });
  }
}

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

  try {
    const data = {
      food: selectedFood.value.id,
      quantity_g: quantityGrams.value,
      meal_type: selectedMealType.value,
      energy_kcal: selectedFood.value.energy_kcal * factor,
      protein_g: selectedFood.value.protein_g * factor,
      carbohydrate_g: selectedFood.value.carbohydrate_g * factor,
      lipid_g: selectedFood.value.lipid_g * factor,
      fiber_g: selectedFood.value.fiber_g * factor,
    };

    if (props.editEntry) {
      await pocketbaseClient.collection("meal_entries").update(props.editEntry.id, data);
      $q.notify({ type: "positive", message: "Refeição atualizada!" });
    } else {
      data.consumed_at = new Date().toISOString().replace("T", " ").slice(0, 19);
      await pocketbaseClient.collection("meal_entries").create(data);
      $q.notify({ type: "positive", message: "Refeição adicionada!" });
    }

    emit("saved");
    dialogVisible.value = false;
  } catch (error) {
    $q.notify({ type: "negative", message: "Erro ao salvar refeição" });
  }
}
</script>
