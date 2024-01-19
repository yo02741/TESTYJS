import { defineStore } from 'pinia'

export const usePatientsStore = defineStore('patients', {
  state: () => ({
    patients: [
      { chart: "123456", name: "王小明", currentUsers: 0 },
      { chart: "214655", name: "陳小寶", currentUsers: 0 },
      { chart: "648191", name: "劉小美", currentUsers: 0 },
      { chart: "851246", name: "吳小花", currentUsers: 0 },
    ],
  }),
  getters: {
    paitentsDict(state) {
      return state.patients.reduce((dict, patient) => {
        dict[patient.chart] = patient
        return dict
      }, {})
    },
  },
})