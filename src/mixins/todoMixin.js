const axios = require("axios");
const apiUrl = "http://localhost:3000";
let localStorageSetting = true;

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r =
        (parseFloat(
          "0." +
            Math.random()
              .toString()
              .replace("0.", "") +
            new Date().getTime()
        ) *
          16) |
        0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const todoMixin = {
  methods: {
    getLocalStorageSetting() {
      return localStorageSetting;
    },
    setLocalStorageSetting(setting) {
      localStorageSetting = setting;
    },
    getTodos() {
      if (localStorageSetting) {
        return new Promise((resolve) => {
          let data = localStorage.getItem("todos");
          if (data === null || data === undefined) {
            data = "[]";
          }
          resolve({
            data: JSON.parse(data),
          });
        });
      }
      return axios.get(`${apiUrl}/todos`);
    },
    addTodo(data, todos, done) {
      if (localStorageSetting) {
        return new Promise((resolve) => {
          let localTodos = todos;
          localTodos.push({
            id: uuidv4(),
            ...data,
          });
          localStorage.setItem(
            "todos",
            JSON.stringify(localTodos.concat(done))
          );
          resolve(this.getTodos());
        });
      }
      return axios.post(`${apiUrl}/todos`, data);
    },
    editTodo(data, todos) {
      // ToDo: Not functional
      if (localStorageSetting) {
        return new Promise((resolve) => {
          localStorage.setItem("todos", JSON.stringify(todos));
          resolve(this.getTodos());
        });
      }

      if (data.id) {
        return axios.put(`${apiUrl}/todos/${data.id}`, data);
      } else {
        return axios.post(`${apiUrl}/todos`, data);
      }
    },
    deleteTodo(id, todos) {
      
      if (localStorageSetting) {
        return new Promise((resolve) => {
          let localTodos = todos.filter((item) => item.id !== id);
          localStorage.setItem("todos", JSON.stringify(localTodos));
          resolve(this.getTodos());
        });
      }

      return axios.delete(`${apiUrl}/todos/${id}`);
    },
  },
};
