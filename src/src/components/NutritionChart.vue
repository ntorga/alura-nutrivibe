<template>
  <apexchart :type="type" :height="height" :options="chartOptions" :series="series" />
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "area",
  },
  height: {
    type: [Number, String],
    default: 350,
  },
  series: {
    type: Array,
    required: true,
  },
  xaxisType: {
    type: String,
    default: "category",
  },
  xaxisMin: {
    type: Number,
    default: undefined,
  },
  xaxisMax: {
    type: Number,
    default: undefined,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  yaxisTitle: {
    type: String,
    default: "",
  },
  colors: {
    type: Array,
    default: () => ["#1976d2"],
  },
});

const chartOptions = computed(() => {
  const baseOptions = {
    chart: {
      toolbar: { show: false },
      fontFamily: "Roboto, sans-serif",
    },
    colors: props.colors,
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0.05 },
    },
    yaxis: {
      title: { text: props.yaxisTitle },
      labels: {
        formatter: (val) => Math.round(val),
      },
    },
    tooltip: { shared: true, intersect: false },
    legend: { position: "top" },
    dataLabels: { enabled: false },
    grid: { borderColor: "#e0e0e0" },
  };

  if (props.xaxisType === "datetime") {
    baseOptions.xaxis = {
      type: "datetime",
      min: props.xaxisMin,
      max: props.xaxisMax,
      labels: {
        format: "dd/MM",
        rotate: -45,
        rotateAlways: true,
      },
      tooltip: { enabled: false },
    };
  } else {
    baseOptions.xaxis = {
      type: "category",
      categories: props.categories,
      labels: {
        rotate: -45,
        rotateAlways: true,
      },
    };
  }

  return baseOptions;
});
</script>
