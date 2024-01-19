import { defineStore } from 'pinia'

export const useYJSStore = defineStore('yjs', {
  state: () => ({
    ydoc: null,
    websocketProvider: null,
    awareness: null,
    isConnected: false,

    myClientId: null,
    userList: [],

    counter: 0,
    textareaValue: '',
  }),
})