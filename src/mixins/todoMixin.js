const axios = require('axios');
const apiUrl = 'http://localhost:3000';
export const todoMixin = {
    methods: {
        getTodos() {
            return axios.get(`${apiUrl}/todos`);
        },
        addTodo(data) {
            window.console.log("Task " + data.description + " added Successfully");
            return axios.post(`${apiUrl}/todos`, data);
        },
        editTodo(data) {
            // ToDo: Not functional
            return axios.put(`${apiUrl}/todos/${data.id}`, data);
        },
        deleteTodo(id) {
            window.console.log("Task With Id " + id + " Deleted/Completed Successfully");
            return axios.delete(`${apiUrl}/todos/${id}`);
        }
    }
}