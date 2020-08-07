import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueMaterial from 'vue-material';
import VeeValidate from 'vee-validate';
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

import Vuetify from "vuetify";
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false;

Vue.use(VueMaterial);
Vue.use(VeeValidate);
Vue.use(Vuetify);

new Vue({
  router,
  store, 
  vuetify: new Vuetify(),
  render: h => h(App)
}).$mount("#app");
