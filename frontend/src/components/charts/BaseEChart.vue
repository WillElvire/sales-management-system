<template>
  <div ref="chartRef" class="echart-container" :style="{ height: normalizedHeight }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer]);

const props = defineProps<{
  options: Record<string, any>;
  height?: number | string;
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const normalizedHeight = computed(() => {
  if (typeof props.height === 'number') {
    return `${props.height}px`;
  }
  return props.height || '320px';
});

const initChart = () => {
  if (!chartRef.value) return;
  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = echarts.init(chartRef.value);
  if (props.options && Object.keys(props.options).length > 0) {
    chartInstance.setOption(props.options, true);
  }
};

const resizeChart = () => {
  chartInstance?.resize();
};

onMounted(() => {
  // Attendre que le DOM soit complètement rendu
  setTimeout(() => {
    initChart();
  }, 100);
  window.addEventListener('resize', resizeChart);
});

watch(
  () => props.options,
  (newOptions) => {
    if (chartInstance && newOptions && Object.keys(newOptions).length > 0) {
      chartInstance.setOption(newOptions, true);
    } else if (chartInstance && (!newOptions || Object.keys(newOptions).length === 0)) {
      chartInstance.clear();
    }
  },
  { deep: true, immediate: true },
);


onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  chartInstance?.dispose();
});
</script>

<style scoped>
.echart-container {
  width: 100%;
}
</style>

