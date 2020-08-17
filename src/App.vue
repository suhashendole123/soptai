<template>
  <div id="app">
    <v-card flat>
      <v-container fluid>
        <v-row class="child-flex">
          <!-- @events just for reference -->
          <router-view
            @addTodo="addTodo"
            @updateTodo="updateTodo"
            @deleteTodo="deleteTodo"
            @drag-start="dragStart"
            @drag-end="dragEnd"
          />
          <!--<div>
          <v-toolbar>
            <v-toolbar-title>TO-DO list with drag drop</v-toolbar-title>
          </v-toolbar>
          </div>-->
        </v-row>
      </v-container>
    </v-card>
  </div>
</template><script>
export default {
  name: "app",
  data: () => {
    return {
      showNavigation: false
    };
  },
  methods: {
    dragStart(data) {
      console.log("event", data);
    },
    dragEnd(data) {
      console.log("event", data);
    },
    addTodo(data) {
      console.log("event", "todo added", data);
    },
    updateTodo(data) {
      console.log("event", "todo updated / edited", data);
    },
    deleteTodo(data) {
      console.log("event", "todo deleted", data);
    }
  }
};
</script><style>
@import "./assets/styles/App.css";

.center {
  text-align: center;
}
form {
  width: 95vw;
  margin: 0 auto;
}
</style>