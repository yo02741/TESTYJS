<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useYJSStore } from "@/store/yjs";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

const yjsStore = useYJSStore();
const {
  ydoc,
  websocketProvider,
  awareness,
  isConnected,
  myClientId,
  userList,
  counter,
  textareaValue,
  todolist,
} = storeToRefs(yjsStore);

const todoText = ref("");

const route = useRoute();
const chart = ref(null);

onMounted(() => {
  onConnect();
});

onUnmounted(() => {
  onDisconnect();
});

const onConnect = () => {
  initWebsocketProvider();
  setupAwareness();
  setupYDoc();

  isConnected.value = true;
};

const initWebsocketProvider = () => {
  chart.value = route.params.chart;
  ydoc.value = new Y.Doc();

  websocketProvider.value = new WebsocketProvider(
    "ws://10.5.71.208:1234",
    chart.value,
    ydoc.value
  );
};

const setupAwareness = () => {
  awareness.value = websocketProvider.value.awareness;
  setMyInfo();
  syncUserList();

  // console.warn(`我是 ${awareness.value.clientID}`);
  awareness.value.on("change", ({ added, updated, removed }) => {
    // console.warn("added", added);
    // console.warn("updated", updated);
    // console.warn("removed", removed);
    // console.warn("---------------------");
    syncUserList();
  });
};

const setMyInfo = () => {
  myClientId.value = awareness.value.clientID;
  awareness.value.setLocalStateField("user", { id: myClientId.value });
};

const syncUserList = () => {
  if (!awareness.value) return;

  // console.warn(
  //   "當前房間有誰？ syncUserList：awareness.value.getStates()",
  //   awareness.value.getStates()
  // );

  userList.value = [...awareness.value.getStates()].map(
    ([clientID, state]) => clientID
  );
};

const setupYDoc = () => {
  // 1. Share 數字
  // 2. Share 字串
  // 3. Share Object - Array

  const ymap = ydoc.value.getMap("shared");
  ymap.set("counter", 0);
  ymap.set("content", "");
  ymap.set("todolist", []);

  ymap.observe((event) => {
    if (event.keysChanged.has("counter")) counter.value = ymap.get("counter")
    if (event.keysChanged.has("content")) textareaValue.value = ymap.get("content")
    if (event.keysChanged.has("todolist")) todolist.value = ymap.get("todolist")
  });
};

const onReset = () => yjsStore.$reset();

const onDisconnect = () => {
  awareness.value.destroy();
  websocketProvider.value.disconnect();
  websocketProvider.value.destroy();
  onReset();
  isConnected.value = false;
};

const plusOne = () => {
  ydoc.value.getMap("shared").set("counter", counter.value + 1);
};

const minusOne = () => {
  ydoc.value.getMap("shared").set("counter", counter.value - 1);
};

const updateText = (e) => {
  ydoc.value.getMap("shared").set("content", e.target.value);
};

const addTodo = () => {
  if (!todoText.value.trim()) {
    todoText.value = "";
    return;
  }

  const todo = {
    id: `${Date.now()}${myClientId.value}`,
    description: todoText.value,
    isDone: false,
  };
  ydoc.value.getMap("shared").set("todolist", [...todolist.value, todo]);
  todoText.value = "";
};

const deleteTodo = (id) => {
  const index = todolist.value.findIndex((item) => item.id === id);
  todolist.value.splice(index, 1);
  ydoc.value.getMap("shared").set("todolist", todolist.value);
};
</script>

<template>
  <div style="display: flex; align-items: center; gap: 20px">
    <div>
      <h1>Patient {{ chart }}</h1>

      <hr />

      <div>
        <span>My information</span>
        &nbsp;
        <span class="user me">{{ myClientId }}</span>
      </div>

      <hr />

      <div>
        <span>User Online：</span>
        <span v-if="!userList.length">None</span>
        <ul v-else>
          <li
            v-for="user in userList"
            :key="user"
            class="user"
            :class="{ me: user === myClientId }"
          >
            {{ user }}
            <span v-if="user === myClientId" class="badge">It's me!</span>
          </li>
        </ul>
      </div>

      <hr />

      <div class="card">
        <button v-if="isConnected" type="button" @click="onDisconnect">
          disconnect
        </button>
        <button v-else type="button" @click="onConnect">connect</button>
      </div>
    </div>

    <div class="editor-area">
      <div class="editor-area-item">
        <b>counter</b>
        <button type="button" @click="minusOne">MINUS</button>
        <span>count is {{ counter }}</span>
        <button type="button" @click="plusOne">PLUS</button>
      </div>
      <div class="editor-area-item">
        <b>content</b>
        <textarea :value="textareaValue" @input="updateText" style="resize: none;"></textarea>
      </div>
      <div class="editor-area-item">
        <b>todolist</b>
        <div style="display: flex; flex-direction: column; align-items: flex-start;">
          <ul v-if="todolist.length">
            <li v-for="item in todolist" :key="item.id">
              <div class="done-or-not" :class="item.isDone ? 'done' : 'not-done'" ></div>
              {{ item.description }}
              <button @click="deleteTodo(item.id)">x</button>
            </li>
          </ul>
          <span v-else>暫無 Todo</span>
          <div class="edit-panel">
            <input type="text" v-model="todoText">
            <button @click="addTodo">+ Todo</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

hr {
  margin: 20px 0;
}

.card {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  padding: 10px;
}

.user.me {
  font-weight: bold;
  color: red;
}

.badge {
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 4px;
  background-color: #eee;
  color: #666;
}

.editor-area {
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 10px;
}

span, b {
  line-height: 40px;
}

.done-or-not {
  width: 10px;
  height: 10px;
}

.editor-area-item {
  display: flex;
  align-items: flex-start;
  min-height: 40px;
  gap: 10px;
}

.edit-panel {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
