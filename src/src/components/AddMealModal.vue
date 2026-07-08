<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 400px; max-width: 700px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ editEntry ? "Editar refeição" : "Adicionar refeição" }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup :disable="isSaving" />
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

        <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
          <q-tab name="manual" label="Manual" />
          <q-tab name="photo" label="Foto" />
        </q-tabs>

        <q-tab-panels v-model="activeTab" animated class="q-mt-md">
          <q-tab-panel name="manual">
            <div v-if="!editEntry">
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

              <q-list v-if="searchResults.length" bordered separator class="rounded-borders q-mt-md" style="max-height: 280px; overflow-y: auto;">
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
                  <q-btn
                    label="Adicionar à lista"
                    color="primary"
                    class="q-mt-sm q-mr-sm"
                    :disable="quantityGrams <= 0"
                    @click="addToManualList"
                  />
                  <q-btn
                    label="Cancelar"
                    flat
                    color="grey"
                    class="q-mt-sm"
                    @click="clearSelection"
                  />
                </q-card>
              </div>

              <div v-if="manualItems.length" class="q-mt-md">
                <div class="text-subtitle2 q-mb-sm">Alimentos adicionados</div>
                <q-list bordered separator class="rounded-borders q-mb-md">
                  <q-item v-for="(item, index) in manualItems" :key="index">
                    <q-item-section>
                      <q-item-label>{{ item.description }}</q-item-label>
                      <q-item-label caption>
                        {{ Math.round((item.foodRecord.energy_kcal * item.quantityGrams) / 100) }} kcal
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="row items-center q-gutter-sm">
                        <q-input
                          v-model.number="item.quantityGrams"
                          type="number"
                          dense
                          outlined
                          style="width: 100px"
                          suffix="g"
                          :rules="[(val) => val > 0 || '']"
                        />
                        <q-btn
                          flat
                          round
                          icon="delete"
                          color="negative"
                          size="sm"
                          @click="removeManualItem(index)"
                        />
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <div class="row justify-end q-gutter-sm q-mt-md">
                <q-btn label="Cancelar" flat v-close-popup :disable="isSaving" />
                <q-btn
                  label="Salvar tudo"
                  color="primary"
                  :loading="isSaving"
                  :disable="!manualItems.length || !selectedMealType"
                  @click="saveManualItems"
                />
              </div>
            </div>

            <div v-else>
              <q-form @submit="onSubmitEdit" class="q-gutter-md">
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

                <q-list v-if="searchResults.length" bordered separator class="rounded-borders" style="max-height: 280px; overflow-y: auto;">
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
            </div>
          </q-tab-panel>

          <q-tab-panel name="photo">
            <div v-if="!recognizedItems.length">
              <PhotoUpload @recognized="onRecognized" @error="onError" />
            </div>

            <div v-else>
              <div class="text-subtitle2 q-mb-sm">Alimentos reconhecidos</div>
              <q-list bordered separator class="rounded-borders q-mb-md">
                <q-item v-for="(item, index) in recognizedItems" :key="index">
                  <q-item-section>
                    <q-item-label>{{ item.description }}</q-item-label>
                    <q-item-label caption>
                      {{ Math.round((item.foodRecord.energy_kcal * item.quantityGrams) / 100) }} kcal
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center q-gutter-sm">
                      <q-input
                        v-model.number="item.quantityGrams"
                        type="number"
                        dense
                        outlined
                        style="width: 100px"
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

              <div class="row justify-between q-gutter-sm">
                <q-btn label="Nova foto" flat @click="resetPhoto" :disable="isSaving" />
                <div class="row q-gutter-sm">
                  <q-btn label="Cancelar" flat v-close-popup :disable="isSaving" />
                  <q-btn
                    label="Salvar tudo"
                    color="primary"
                    :loading="isSaving"
                    :disable="!recognizedItems.length || !selectedMealType"
                    @click="saveAllItems"
                  />
                </div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { pocketbaseClient } from "@/boot/pocketbase";
import { useQuasar } from "quasar";
import PhotoUpload from "@/components/PhotoUpload.vue";

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
const mealTypeMap = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
};

const selectedMealType = ref("");
const activeTab = ref("manual");
const searchQuery = ref("");
const searchResults = ref([]);
const selectedFood = ref(null);
const quantityGrams = ref(100);
const manualItems = ref([]);
const recognizedItems = ref([]);
const isSaving = ref(false);

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
  activeTab.value = "manual";
  searchQuery.value = "";
  searchResults.value = [];
  selectedFood.value = null;
  quantityGrams.value = 100;
  manualItems.value = [];
  recognizedItems.value = [];
  isSaving.value = false;
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
    const fetchResponse = await fetch(
      `http://127.0.0.1:8090/api/foods/search?q=${encodeURIComponent(query)}`
    );
    if (!fetchResponse.ok) throw new Error("Search failed");
    const responseData = await fetchResponse.json();
    searchResults.value = responseData.items;
  } catch (error) {
    searchResults.value = [];
  }
}

function selectFood(food) {
  selectedFood.value = food;
  searchResults.value = [];
  searchQuery.value = "";
}

function clearSelection() {
  selectedFood.value = null;
  quantityGrams.value = 100;
}

function addToManualList() {
  if (!selectedFood.value || quantityGrams.value <= 0) return;

  if (manualItems.value.length >= 5) {
    $q.notify({
      color: "warning",
      message: "Limite de 5 alimentos por refeição",
      icon: "warning",
    });
    return;
  }

  manualItems.value.push({
    foodRecord: selectedFood.value,
    description: selectedFood.value.description,
    quantityGrams: quantityGrams.value,
  });

  selectedFood.value = null;
  quantityGrams.value = 100;
  searchQuery.value = "";
  searchResults.value = [];
}

function removeManualItem(index) {
  manualItems.value.splice(index, 1);
}

async function saveManualItems() {
  if (!manualItems.value.length || !selectedMealType.value) return;

  isSaving.value = true;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  try {
    for (const item of manualItems.value) {
      const factor = item.quantityGrams / 100;
      await pocketbaseClient.collection("meal_entries").create({
        food: item.foodRecord.id,
        quantity_g: item.quantityGrams,
        meal_type: selectedMealType.value,
        consumed_at: now,
        energy_kcal: item.foodRecord.energy_kcal * factor,
        protein_g: item.foodRecord.protein_g * factor,
        carbohydrate_g: item.foodRecord.carbohydrate_g * factor,
        lipid_g: item.foodRecord.lipid_g * factor,
        fiber_g: item.foodRecord.fiber_g * factor,
      });
    }

    $q.notify({ type: "positive", message: "Refeição salva!" });
    emit("saved");
    dialogVisible.value = false;
  } catch (error) {
    $q.notify({ type: "negative", message: "Erro ao salvar refeição" });
  } finally {
    isSaving.value = false;
  }
}

async function onSubmitEdit() {
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

    await pocketbaseClient.collection("meal_entries").update(props.editEntry.id, data);
    $q.notify({ type: "positive", message: "Refeição atualizada!" });

    emit("saved");
    dialogVisible.value = false;
  } catch (error) {
    $q.notify({ type: "negative", message: "Erro ao salvar refeição" });
  }
}

async function onRecognized(responseData) {
  if (responseData.mealType && mealTypeMap[responseData.mealType]) {
    selectedMealType.value = mealTypeMap[responseData.mealType];
  }

  const foodLookups = await Promise.all(
    responseData.entries.map(async (entry) => {
      try {
        const foodResults = await pocketbaseClient.collection("foods").getList(1, 1, {
          filter: `taco_id = ${entry.tacoId}`,
        });
        return {
          tacoId: entry.tacoId,
          description: entry.description,
          quantityGrams: entry.quantityGrams,
          foodRecord: foodResults.items[0] || null,
        };
      } catch (error) {
        return {
          tacoId: entry.tacoId,
          description: entry.description,
          quantityGrams: entry.quantityGrams,
          foodRecord: null,
        };
      }
    })
  );

  recognizedItems.value = foodLookups.filter((item) => item.foodRecord);

  if (!recognizedItems.value.length) {
    $q.notify({
      color: "negative",
      message: "Nenhum alimento reconhecido",
      icon: "error",
    });
  }
}

function onError() {
  $q.notify({
    color: "negative",
    message: "Erro ao reconhecer refeição",
    icon: "error",
  });
}

function removeItem(index) {
  recognizedItems.value.splice(index, 1);
}

function resetPhoto() {
  recognizedItems.value = [];
}

async function saveAllItems() {
  if (!recognizedItems.value.length || !selectedMealType.value) return;

  isSaving.value = true;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  try {
    for (const item of recognizedItems.value) {
      const factor = item.quantityGrams / 100;
      await pocketbaseClient.collection("meal_entries").create({
        food: item.foodRecord.id,
        quantity_g: item.quantityGrams,
        meal_type: selectedMealType.value,
        consumed_at: now,
        energy_kcal: item.foodRecord.energy_kcal * factor,
        protein_g: item.foodRecord.protein_g * factor,
        carbohydrate_g: item.foodRecord.carbohydrate_g * factor,
        lipid_g: item.foodRecord.lipid_g * factor,
        fiber_g: item.foodRecord.fiber_g * factor,
      });
    }

    $q.notify({ type: "positive", message: "Refeição salva!" });
    emit("saved");
    dialogVisible.value = false;
  } catch (error) {
    $q.notify({ type: "negative", message: "Erro ao salvar refeição" });
  } finally {
    isSaving.value = false;
  }
}
</script>
