<template>
  <div class="home">
    <div class="center">
      <md-button class="md-raised" @click="showDialog = true">Add New Task To List</md-button>
      <v-alert type="info">To complete a To-Do please drag from left to right, All TO-DO tasks can be deleted in left before completion Or after completion on right.</v-alert>      
    </div><div class="content">
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
          </md-field><md-dialog-actions>
            <md-button class="md-primary" @click="showDialog = false">Close</md-button>
            <md-button class="md-primary" @click="addTodo(taskData); showDialog = false;">Save</md-button>
          </md-dialog-actions>
        </form>
      </md-dialog>
      <div class="lists">        
        <div class="left">
          <h2 class="center">Newly added To-Do Tasks</h2>
          <draggable 
          v-model="todo" 
          group="tasks" 
          @change="updateTodo">           
            <div v-for="t in todo" :key="t.id" class="item" >
              <b>{{t.description}}</b>
              <v-btn color="md-primary"  @click="deleteTask(t.id)">
                <v-icon left>{{ icons.mdiDelete }}</v-icon>Delete</v-btn>
            </div>
          </draggable>
        </div>
        <div class="right">
          <h2 class="center">Completed To-Do Tasks</h2>
          <draggable class="scroller"
            v-model="done" 
            group="tasks"
            @change="updateTodo">
            <div v-for="d in sortedItems" :key="d.id" class="item" >
              <b><strike>
                {{d.description}}
                </strike></b>
              <v-btn class="ma-2" @click="deleteTask(d.id)" color="md-accent">Completed
                <v-icon right>mdi-checkbox-marked-circle</v-icon>
              </v-btn>
            </div>            
          </draggable>          
        </div>
      </div>
    </div>
  </div>
</template><script>
import draggable from "vuedraggable";
import { todoMixin } from "@/mixins/todoMixin";
import { mdiDelete } from "@mdi/js"

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
      function compare(a, b) {
        if (a.description < b.description)
          return -1;
        if (a.description > b.description)
          return 1;
        return 0;
      }
      return JSON.parse(JSON.stringify(this.done)).sort(compare);
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
        mdiDelete,
      },
    };
  },
  beforeMount() {
    this.getNewTodos();
  },
   render (h) {
        return h('draggable', { 
            props: { ...this.$attrs, value: this.list },
            on: { input: ($event) => { this.list = $event } }
        }, this.list.map(el => {
           el.vnode.key = el.id
           return el.vnode
        }))
    },
  methods: {
    async addNewTodo(evt) {
      evt.preventDefault();
      if (!this.isFormDirty || this.errors.items.length > 0) {
        return;
      }
      await this.addTodo(this.taskData);
      window.console.log("Task with Id " + this.taskData + " added  ");
      this.getNewTodos();
      this.showDialog = false;
    },    async getNewTodos() {
      const response = await this.getTodos();
      this.todo = response.data.filter(t => !t.done);
      this.done = response.data.filter(t => t.done);
    },
    async updateTodo(evt) {
      let todo = evt.removed && evt.removed.element;
      
      if (todo) {
        todo.done = !todo.done;
        await this.editTodo(todo);
      }

      if(evt.removed){
        window.console.log("Removed "+ evt.removed.element.description );
        window.console.log(evt);
      }else if(evt.added){
        window.console.log("Added " + evt.added.element.description);
        window.console.log(evt);
      }       
    },    async deleteTask(id) {
      // window.console.log("Task With Id " + id + " Deleted/Completed Successfully");
      const todo = await this.deleteTodo(id);
      window.console.log(todo);      
      this.getNewTodos();
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
.red{
  color:red;
}
.center {
  text-align: center;
  padding: 7px;
}.md-dialog {
  width: 100vw;
}form {
  width: 92%;
}.md-dialog-title.md-title {
  color: black !important;
}.lists {
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
</style>