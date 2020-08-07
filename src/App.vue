<template>
  <div id="app">
    <v-card flat>
    <v-container fluid>
      <v-row class="child-flex">
        <div>
          <v-toolbar>
            <v-toolbar-title>TO-DO list with drag drop</v-toolbar-title>
          </v-toolbar>
        </div>       
      </v-row>
    </v-container>
  </v-card>
  <router-view />
  </div>
</template><script>
export default {
  
  name: "app",
  data: () => {
    return {
      showNavigation: false
    };
  }
};
</script><style>
  @import './assets/styles/App.css';

.center {
  text-align: center;
}form {
  width: 95vw;
  margin: 0 auto;
}
</style>