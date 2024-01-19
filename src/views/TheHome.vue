<script setup>
import { usePatientsStore } from "@/store/patients";
import { storeToRefs } from "pinia";

const patientsStore = usePatientsStore();
const { patients } = storeToRefs(patientsStore);
</script>

<template>
  <div class="flex-column">
    <button
      v-for="patient in patients"
      :key="patient.chart"
      type="button"
      @click="() => $router.push(`/patient/${patient.chart}`)"
    >
      {{ patient.chart }} {{ patient.name }}
    </button>
  </div>
</template>

<style scoped>
.flex-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
