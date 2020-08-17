<template>
  <div class="home">
    <v-toolbar>
      <v-toolbar-title>Todo list with drag drop</v-toolbar-title>
      <v-spacer />
      <md-checkbox
        v-model="localStorageSettings"
        class="md-raised md-primary"
        @change="changeSettings"
      >Local Storage</md-checkbox>
      <md-button class="md-raised md-primary" @click="showDialog = true">Add Todo</md-button>
    </v-toolbar>
    <div class="center">
      <v-alert
        class
        type="info"
        outlined
        dismissible
        v-if="!localStorageSettings"
      >Without Local Storage some functionalities will not work as intended.</v-alert>
      <v-alert class type="info" outlined dismissible>
        To complete a Todo please drag from left to right,
        <br />All Todo tasks can be deleted in left before completion or after completion on right.
      </v-alert>
    </div>
    <div class="content">
      <md-dialog :md-active.sync="showDialog">
        <md-dialog-title>Add Todo</md-dialog-title>
        <form @submit="addNewTodo" novalidate>
          <md-field :class="{ 'md-invalid': errors.has('description') }">
            <label for="description">Description</label>
            <md-input
              type="text"
              name="description"
              v-model="taskData.description"
              v-validate="'required'"
            ></md-input>
            <span class="md-error" v-if="errors.has('description')">{{errors.first('description')}}</span>
          </md-field>
          <md-dialog-actions>
            <md-button class="md-primary" @click="showDialog = false">Cancel</md-button>
            <md-button class="md-primary" @click="addNewTodo">Add</md-button>
          </md-dialog-actions>
        </form>
      </md-dialog>
      <div class="lists">
        <div class="left">
          <h2 class="center">Newly added To-Do Tasks</h2>
          <v-sheet outlined height="400">
            <v-sheet v-if="!todo.length" align="center" absolute>No data available</v-sheet>
            <draggable
              v-model="todo"
              group="tasks"
              animation="200"
              ghostClass="ghost"
              @change="updateTodo"
              style="height:100%"
              @start="$emit('drag-start', 'dragging started'); drag = true"
              @end="$emit('drag-end', 'dragging ended'); drag = false"
            >
              <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                <div v-for="t in todo" :key="t.id" class="item">
                  <b>{{t.description}}</b>
                  <v-btn color="md-primary" @click="deleteTask(t.id)">
                    <v-icon left>{{ icons.mdiDelete }}</v-icon>Delete
                  </v-btn>
                </div>
              </transition-group>
            </draggable>
          </v-sheet>
        </div>
        <div class="right">
          <h2 class="center">Completed To-Do Tasks</h2>
          <v-sheet outlined height="400" class="d-flex">
            <v-sheet v-if="!sortedItems.length" align="center">Drag some todo item</v-sheet>
            <draggable
              class="scroller"
              v-model="done"
              group="tasks"
              @change="updateTodo"
              style="height:100%"
            >
              <div v-for="d in sortedItems" :key="d.id" class="item">
                <b>
                  <strike>{{d.description}}</strike>
                </b>
                <v-btn class="ma-2" @click="deleteTask(d.id)" color="md-accent">
                  Completed
                  <v-icon right>mdi-checkbox-marked-circle</v-icon>
                </v-btn>
              </div>
            </draggable>
          </v-sheet>
        </div>
      </div>
    </div>
  </div>
</template><script>
import draggable from "vuedraggable";
import { todoMixin } from "@/mixins/todoMixin";
import { mdiDelete } from "@mdi/js";

function compare(a, b) {
  return b.index < a.index;
}

export default {
  name: "home",
  components: {
    draggable
  },
  computed: {
    isFormDirty() {
      return Object.keys(this.fields).some(key => this.fields[key].dirty);
    },
    // Manual sort for droppable items
    sortedItems: function() {
      return JSON.parse(JSON.stringify(this.done)); //.sort(compare);
    }
  },
  mixins: [todoMixin],
  data() {
    return {
      todo: [],
      done: [],
      list: [],
      showDialog: false,
      enableSort: false,
      sorting: -1,
      taskData: {},
      icons: {
        mdiDelete
      },
      localStorageSettings: this.getLocalStorageSetting(),
      drag: false
    };
  },
  beforeMount() {
    this.getNewTodos();
  },
  methods: {
    changeSettings() {
      this.setLocalStorageSetting(this.localStorageSettings);
      this.getNewTodos();
    },
    async addNewTodo(evt) {
      evt.preventDefault();
      if (!this.isFormDirty || this.errors.items.length > 0) {
        return;
      }
      const localTodo = JSON.parse(JSON.stringify(this.todo));
      const localDone = JSON.parse(JSON.stringify(this.done));
      await this.addTodo(this.taskData, localTodo, localDone);
      await this.getNewTodos();
      this.showDialog = false;
      this.$emit("addTodo", {
        newTodo: this.taskData
      });
      this.taskData = {};
    },
    async getNewTodos() {
      let response = await this.getTodos();
      const sortedResponse = response.data.sort(compare);
      this.todo = sortedResponse.filter(t => !t.done);
      this.done = sortedResponse.filter(t => t.done);
    },
    async updateTodo(evt) {
      let todo =
        (evt.removed && evt.removed.element) ||
        (evt.moved && evt.moved.element);
      let localTodos = [];
      if (evt.removed && evt.removed.element) {
        todo.done = !todo.done;
        localTodos = JSON.parse(JSON.stringify(this.todo.concat(this.done)));
        await this.editTodo(todo, localTodos);
      } else if (evt.moved && evt.moved.element) {
        localTodos = JSON.parse(JSON.stringify(this.todo.concat(this.done)));
        await this.editTodo(todo, localTodos);
      }

      if (evt.removed) {
        //window.console.log("Removed " + evt.removed.element.description);
        //window.console.log(evt);
      } else if (evt.added) {
        //window.console.log("Added " + evt.added.element.description);
        //window.console.log(evt);
      }

      if (evt) {
        this.$emit("updateTodo", {
          todoEvent: evt,
          currentTodo: todo,
          todos: localTodos
        });
      }
    },
    async deleteTask(id) {
      const localTodos = JSON.parse(
        JSON.stringify(this.todo.concat(this.done))
      );
      const todo = await this.deleteTodo(id, localTodos);
      await this.getNewTodos();
      this.$emit("deleteTodo", {
        todoId: id,
        currentTodo: todo,
        todos: localTodos
      });
    },
    log: function(evt) {
      window.console.log(evt);
    }
  }
};
</script><style lang="scss" scoped>
div.v-icon {
  color: red;
}
.red {
  color: red;
}
.center {
  text-align: center;
  padding: 7px;
}
.md-dialog {
  width: 100vw;
}
form {
  width: 92%;
}
.md-dialog-title.md-title {
  color: black !important;
}
.lists {
  padding-left: 5vw;
  display: flex;
  align-items: flex-start;
  .left,
  .right {
    width: 45vw;
    padding: 20px;
    min-height: 200px;
    .item {
      padding: 10px;
      margin: 10px;
      border: 1px solid black;
      background-color: white;
      display: flex;
      justify-content: space-between;
      a {
        cursor: pointer;
      }
    }
  }
}
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>