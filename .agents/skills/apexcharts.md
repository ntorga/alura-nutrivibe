---
shortDescription: "ApexCharts.js chart library with Vue 3 integration via vue3-apexcharts for Quasar projects"
version: "1.2.0"
lastUpdated: "2026-06-28"
---

## Purpose

ApexCharts is a JavaScript charting library supporting 16+ chart types (line, bar, pie, donut, radar, heatmap, candlestick, etc.). In Vue 3 / Quasar projects, use the `vue3-apexcharts` wrapper which handles `destroy()` on unmount, reactive props, and idiomatic events. Install both `vue3-apexcharts` and `apexcharts`.

## Procedure

**Pre-flight: verify packages are installed.** Check `package.json` or install if missing:

```bash
grep -q '"apexcharts"' package.json && grep -q '"vue3-apexcharts"' package.json \
  || pnpm add vue3-apexcharts apexcharts
```

### 1. Setup in Quasar

Create boot file `src/boot/apexcharts.js`:

```js
import { defineBoot } from '#q-app'
import VueApexCharts from 'vue3-apexcharts'

export default defineBoot(({ app }) => {
  app.use(VueApexCharts)
})
```

Add boot file in `quasar.config.js`:

```js
boot: ['apexcharts']
```

### 2. Basic Usage in a Quasar Page/Component

```vue
<template>
  <q-card>
    <q-card-section>
      <apexchart
        type="bar"
        height="350"
        :options="chartOptions"
        :series="series"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'

const chartOptions = ref({
  chart: { type: 'bar' },
  xaxis: { categories: ['Jan', 'Feb', 'Mar'] },
  plotOptions: { bar: { horizontal: false } }
})

const series = ref([
  { name: 'Revenue', data: [44, 55, 41] }
])
</script>
```

### 3. Updating Data

The wrapper watches `series` and `options` props and calls update methods automatically:

```vue
<script setup>
import { ref } from 'vue'

const series = ref([{ data: [44, 55, 41] }])

function updateData() {
  series.value = [{ data: [10, 20, 30] }]
}
</script>
```

## Series Data Formats

### Axis Charts (line, area, bar, scatter, etc.)

**Line** (`chart.type: 'line'`)
- Format: `[{ name, data: [number | null] }]`
- Example: `[{ name: 'Sales', data: [30, 40, null, 50] }]`

**Area** (`chart.type: 'area'`)
- Format: Same as line

**Bar/Column** (`chart.type: 'bar'`)
- Format: Same as line
- Set `plotOptions.bar.horizontal: true` for horizontal bars

**Scatter** (`chart.type: 'scatter'`)
- Format: `[{ name, data: [{ x, y }] }]` (always use XY format)

**Bubble** (`chart.type: 'bubble'`)
- Format: `[{ name, data: [{ x, y, z }] }]` (z is required — bubble size)

**Range Area** (`chart.type: 'rangeArea'`)
- Format: `[{ name, data: [{ x, y: [low, high] }] }]`

**Range Bar** (`chart.type: 'rangeBar'`)
- Format: `[{ name, data: [{ x, y: [start, end] }] }]`
- For timeline/Gantt, use timestamps

**Candlestick** (`chart.type: 'candlestick'`)
- Format: `[{ data: [{ x, y: [O, H, L, C] }] }]` (array of 4: Open, High, Low, Close)

**Box Plot** (`chart.type: 'boxPlot'`)
- Format: `[{ data: [{ x, y: [min, Q1, median, Q3, max] }] }]` (array of 5)

**Heatmap** (`chart.type: 'heatmap'`)
- Format: `[{ name, data: [{ x, y: number }] }]` (y is the intensity value)

**Treemap** (`chart.type: 'treemap'`)
- Format: `[{ data: [{ x, y: number }] }]` (y is the area/value)

**Radar** (`chart.type: 'radar'`)
- Format: `[{ name, data: [number] }]` + `xaxis: { categories: [...] }`

### Non-Axis Charts (pie, donut, radialBar, polarArea)

Use a flat number array for `series`, NOT object format:

```js
// pie / donut / polarArea
{
  chart: { type: 'pie' },
  series: [44, 55, 13, 43, 22],
  labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E']
}

// radialBar (values must be 0-100, representing percentages)
{
  chart: { type: 'radialBar' },
  series: [76, 67, 61],
  labels: ['Apples', 'Oranges', 'Bananas']
}
```

## Tree-Shaking

**Full bundle**: `import ApexCharts from 'apexcharts'` — all 16 chart types + all features

**Per-type entries** (for smaller bundles):
- `apexcharts/line` — line, area, scatter, bubble, rangeArea
- `apexcharts/bar` — bar, column, rangeBar
- `apexcharts/candlestick` — candlestick, boxPlot
- `apexcharts/pie` — pie, donut, polarArea
- `apexcharts/radialBar` — radialBar only
- `apexcharts/radar` — radar only
- `apexcharts/heatmap` — heatmap only
- `apexcharts/treemap` — treemap only

**Optional feature imports** (required when using per-type entries):

```js
import 'apexcharts/features/legend'
import 'apexcharts/features/toolbar'
import 'apexcharts/features/annotations'
import 'apexcharts/features/exports'
import 'apexcharts/features/keyboard'
import 'apexcharts/features/all'
```

**Vite config** to prevent duplicate bundles:

```js
export default {
  optimizeDeps: {
    include: ['apexcharts/line', 'apexcharts/features/legend']
  }
}
```

## Formatter Signatures

- `xaxis.labels.formatter`: `(value, timestamp?, opts?) => string`
- `yaxis.labels.formatter`: `(value, opts?) => string`
- `tooltip.x.formatter`: `(value, opts?) => string`
- `tooltip.y.formatter`: `(value, opts?) => string`
- `tooltip.y.title.formatter`: `(seriesName, opts?) => string`
- `tooltip.z.formatter`: `(value) => string`
- `dataLabels.formatter`: `(value, opts?) => string | number`
- `legend.formatter`: `(legendName, opts?) => string`
- `plotOptions.pie.donut.labels.value.formatter`: `(val) => string`
- `plotOptions.pie.donut.labels.total.formatter`: `(w) => string`
- `plotOptions.radialBar.dataLabels.value.formatter`: `(val) => string`

All formatters must return a `string` (or `number` for `dataLabels.formatter`). Never return `undefined`.

## API Methods

### Instance Methods

- `render()` — renders the chart, returns `Promise<ApexCharts>`
- `destroy()` — destroys instance and removes DOM elements
- `updateOptions(options, redraw?, animate?, updateSyncedCharts?)` — merges options and re-renders, returns `Promise`
- `updateSeries(newSeries, animate?)` — replaces series data, returns `Promise`
- `appendSeries(newSeries, animate?)` — appends a new series, returns `Promise`
- `appendData(newData)` — appends data points, returns `Promise`
- `toggleSeries(seriesName)` — show/hide series by name
- `showSeries(seriesName)` — show a hidden series
- `hideSeries(seriesName)` — hide a visible series
- `resetSeries(shouldUpdateChart?, shouldResetZoom?)` — resets to initial data
- `zoomX(min, max)` — programmatically zoom x-axis
- `addXaxisAnnotation(opts)` — add x-axis annotation
- `addYaxisAnnotation(opts)` — add y-axis annotation
- `addPointAnnotation(opts)` — add point annotation
- `removeAnnotation(id)` — remove annotation by id
- `clearAnnotations()` — remove all annotations
- `dataURI(options?)` — export as data URI, returns `Promise` (requires `apexcharts/features/exports`)
- `getSvgString(scale?)` — get SVG markup, returns `Promise<string>` (requires `apexcharts/features/exports`)
- `exportToCSV(options?)` — trigger CSV download (requires `apexcharts/features/exports`)
- `setLocale(localeName)` — switch locale

### Chart Events

```js
{
  chart: {
    events: {
      beforeMount: (chart, options) => {},
      mounted: (chart, options) => {},
      updated: (chart, options) => {},
      animationEnd: (chart, options) => {},
      click: (event, chart, options) => {},
      mouseMove: (event, chart, options) => {},
      mouseLeave: (event, chart, options) => {},
      legendClick: (chart, seriesIndex, options) => {},
      markerClick: (event, chart, options) => {},
      xAxisLabelClick: (event, chart, options) => {},
      dataPointSelection: (event, chart, options) => {},
      dataPointMouseEnter: (event, chart, options) => {},
      dataPointMouseLeave: (event, chart, options) => {},
      beforeZoom: (chart, { xaxis }) => {},
      zoomed: (chart, { xaxis }) => {},
      beforeResetZoom: (chart, options) => {},
      scrolled: (chart, { xaxis }) => {},
      selection: (chart, { xaxis, yaxis }) => {}
    }
  }
}
```

## Guardrails

- **Series data format is chart-type-specific** — pie/donut/radialBar use flat arrays `[44, 55]`, not `[{ name, data }]`.
- **Use `null` (not `undefined`) for missing data** — `undefined` is silently ignored.
- **`yaxis` must be an array for multiple y-axes** — each entry needs `seriesName` to map correctly.
- **`tooltip.shared` and `tooltip.intersect` are mutually exclusive** — pick one mode.
- **`chart.stacked: true` only works with `bar` and `area`** — not line, scatter, etc.
- **Mixed/combo charts need per-series `type`** — set `type` on each series object.
- **RadialBar values must be 0-100** — they represent percentages.
- **Replace config objects in Vue, don't mutate** — `chartOptions.value = { ...chartOptions.value, xaxis: {...} }` not `chartOptions.value.xaxis.push()`.
- **Tree-shaking features fail silently** — import `apexcharts/features/legend`, `toolbar`, `annotations` explicitly.
- **For Quasar SSR mode, use dynamic imports** — the wrapper accesses `window`/`document`:

```js
const ApexChart = defineAsyncComponent({
  loader: () => import('vue3-apexcharts'),
  ssrIncompatible: true
})
```
