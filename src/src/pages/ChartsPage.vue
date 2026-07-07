<template>
  <q-page class="q-pa-md q-pb-xl">
    <div class="text-h5 q-mb-md">Gráficos</div>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <q-btn-toggle
            v-model="timeRange"
            toggle-color="primary"
            :options="[
              { label: 'Semana', value: 'week' },
              { label: 'Mês', value: 'month' },
            ]"
          />
          <q-space />
          <q-btn-toggle
            v-model="activeMetric"
            toggle-color="primary"
            outline
            :options="metricOptions"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <NutritionChart
          :series="chartSeries"
          :xaxis-type="chartXaxisType"
          :xaxis-min="chartXaxisMin"
          :xaxis-max="chartXaxisMax"
          :colors="chartColors"
          :yaxis-title="currentMetricLabel"
          :height="280"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { pocketbaseClient } from "@/boot/pocketbase";
import { useQuasar } from "quasar";
import NutritionChart from "@/components/NutritionChart.vue";
import { useAddMealModal } from "@/composables/useAddMealModal";

const $q = useQuasar();
const { mealSavedCount } = useAddMealModal();

const timeRange = ref("week");
const activeMetric = ref("energyKcal");
const dailyData = ref({});

const metricOptions = [
  { label: "Calorias", value: "energyKcal" },
  { label: "Proteína", value: "proteinG" },
  { label: "Carbos", value: "carbohydrateG" },
  { label: "Gordura", value: "lipidG" },
];

const metricLabels = {
  energyKcal: "Calorias (kcal)",
  proteinG: "Proteína (g)",
  carbohydrateG: "Carbos (g)",
  lipidG: "Gordura (g)",
};

const metricColors = {
  energyKcal: ["#1976d2"],
  proteinG: ["#1976d2"],
  carbohydrateG: ["#f57c00"],
  lipidG: ["#d32f2f"],
};

const currentMetricLabel = computed(() => metricLabels[activeMetric.value]);
const chartColors = computed(() => metricColors[activeMetric.value]);
const chartXaxisType = computed(() => "datetime");

const chartXaxisMin = computed(() => {
  const dates = getDateRange();
  return new Date(dates[0]).getTime();
});

const chartXaxisMax = computed(() => {
  const dates = getDateRange();
  return new Date(dates[dates.length - 1]).getTime();
});

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

function getDateRange() {
  const days = timeRange.value === "week" ? 7 : 30;
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
}

const dateFilter = computed(() => {
  const dates = getDateRange();
  const startDate = dates[0];
  const endDate = parseDate(dates[dates.length - 1]);
  endDate.setDate(endDate.getDate() + 1);
  const start = parseDate(startDate).toISOString().replace("T", " ").slice(0, 19);
  const end = endDate.toISOString().replace("T", " ").slice(0, 19);
  return `consumed_at >= "${start}" && consumed_at < "${end}"`;
});

const chartSeries = computed(() => {
  const dates = getDateRange();
  const data = dates.map((date) => {
    const dayData = dailyData.value[date];
    const value = dayData ? Math.round(dayData[activeMetric.value] || 0) : 0;
    return { x: new Date(date).getTime(), y: value };
  });
  return [{ name: currentMetricLabel.value, data }];
});

async function fetchDailyData() {
  try {
    const result = await pocketbaseClient.collection("meal_entries").getFullList({
      filter: dateFilter.value,
      sort: "consumed_at",
    });

    const grouped = {};
    for (const entry of result) {
      const date = entry.consumed_at?.split(" ")[0] || entry.consumed_at?.split("T")[0];
      if (!date) continue;
      if (!grouped[date]) {
        grouped[date] = { energyKcal: 0, proteinG: 0, carbohydrateG: 0, lipidG: 0 };
      }
      grouped[date].energyKcal += entry.energy_kcal || 0;
      grouped[date].proteinG += entry.protein_g || 0;
      grouped[date].carbohydrateG += entry.carbohydrate_g || 0;
      grouped[date].lipidG += entry.lipid_g || 0;
    }
    dailyData.value = grouped;
  } catch (error) {
    $q.notify({ type: "negative", message: "Erro ao carregar dados do gráfico" });
  }
}

onMounted(fetchDailyData);

watch(timeRange, fetchDailyData);
watch(mealSavedCount, fetchDailyData);
</script>
