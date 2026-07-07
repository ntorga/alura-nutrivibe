<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Histórico</div>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section class="row items-center q-gutter-sm">
        <q-btn flat round icon="chevron_left" @click="changeDate(-1)" />
        <q-input v-model="dateDisplay" filled dense readonly style="max-width: 180px">
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="selectedDate"
                  mask="YYYY-MM-DD"
                  :locale="dateLocale"
                  @update:model-value="onDateChange"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-btn flat round icon="chevron_right" @click="changeDate(1)" />
        <q-btn v-if="!isToday" flat label="Hoje" color="primary" @click="goToToday" />
      </q-card-section>
    </q-card>

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
            {{ entry.expand?.food?.description || "Alimento" }} — {{ entry.quantity_g }}g ({{
              Math.round(entry.energy_kcal)
            }}
            kcal)
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center q-gutter-xs">
            <q-btn
              flat
              round
              icon="edit"
              color="primary"
              size="sm"
              @click="editEntry(group.entries[0])"
            />
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              size="sm"
              @click="confirmDelete(group.entries[0].id)"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <div v-else class="text-grey text-center q-pa-xl">
      <q-icon name="restaurant" size="48px" class="q-mb-md" />
      <div>Nenhuma refeição registrada neste dia</div>
    </div>

    <AddMealModal v-model="editModalOpen" :edit-entry="editingEntry" @saved="onEntrySaved" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { pocketbaseClient } from "@/boot/pocketbase";
import { useQuasar } from "quasar";
import AddMealModal from "@/components/AddMealModal.vue";
import { useAddMealModal } from "@/composables/useAddMealModal";

const $q = useQuasar();
const { mealSavedCount } = useAddMealModal();

const selectedDate = ref(formatDate(new Date()));
const mealEntries = ref([]);
const editModalOpen = ref(false);
const editingEntry = ref(null);

const mealTypeOrder = ["Café da manhã", "Almoço", "Lanche", "Jantar"];

const dateLocale = {
  days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
  daysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  months: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const dateDisplay = computed(() => {
  const date = parseDate(selectedDate.value);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
});

const isToday = computed(() => {
  return selectedDate.value === formatDate(new Date());
});

const dateFilter = computed(() => {
  const date = parseDate(selectedDate.value);
  const startDate = date.toISOString().replace("T", " ").slice(0, 19);
  const endDate = new Date(date.getTime() + 86400000).toISOString().replace("T", " ").slice(0, 19);
  return `consumed_at >= "${startDate}" && consumed_at < "${endDate}"`;
});

const totals = computed(() => {
  return mealEntries.value.reduce(
    (acc, entry) => ({
      energyKcal: acc.energyKcal + (entry.energy_kcal || 0),
      proteinG: acc.proteinG + (entry.protein_g || 0),
      carbohydrateG: acc.carbohydrateG + (entry.carbohydrate_g || 0),
      lipidG: acc.lipidG + (entry.lipid_g || 0),
    }),
    { energyKcal: 0, proteinG: 0, carbohydrateG: 0, lipidG: 0 },
  );
});

const groupedEntries = computed(() => {
  const groups = {};
  for (const entry of mealEntries.value) {
    const mealType = entry.meal_type || "Outros";
    if (!groups[mealType]) {
      groups[mealType] = { mealType, entries: [] };
    }
    groups[mealType].entries.push(entry);
  }
  return Object.values(groups).sort((a, b) => {
    return mealTypeOrder.indexOf(a.mealType) - mealTypeOrder.indexOf(b.mealType);
  });
});

function changeDate(offset) {
  const date = parseDate(selectedDate.value);
  date.setDate(date.getDate() + offset);
  selectedDate.value = formatDate(date);
  fetchMealEntries();
}

function goToToday() {
  selectedDate.value = formatDate(new Date());
  fetchMealEntries();
}

function onDateChange() {
  fetchMealEntries();
}

async function fetchMealEntries() {
  try {
    const result = await pocketbaseClient.collection("meal_entries").getFullList({
      filter: dateFilter.value,
      sort: "consumed_at",
      expand: "food",
    });
    mealEntries.value = result;
  } catch (error) {
    $q.notify({ type: "negative", message: "Erro ao carregar refeições" });
  }
}

function editEntry(entry) {
  editingEntry.value = entry;
  editModalOpen.value = true;
}

function confirmDelete(entryId) {
  $q.dialog({
    title: "Confirmar exclusão",
    message: "Deseja realmente excluir esta refeição?",
    cancel: { label: "Cancelar", flat: true },
    ok: { label: "Excluir", color: "negative" },
  }).onOk(() => deleteEntry(entryId));
}

async function deleteEntry(entryId) {
  try {
    await pocketbaseClient.collection("meal_entries").delete(entryId);
    mealEntries.value = mealEntries.value.filter((e) => e.id !== entryId);
    $q.notify({ type: "positive", message: "Refeição excluída" });
  } catch (error) {
    $q.notify({ type: "negative", message: "Erro ao excluir refeição" });
  }
}

function onEntrySaved() {
  editModalOpen.value = false;
  editingEntry.value = null;
  fetchMealEntries();
}

onMounted(fetchMealEntries);

watch(selectedDate, fetchMealEntries);
watch(mealSavedCount, fetchMealEntries);
</script>
