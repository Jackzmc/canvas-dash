import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

import '@mdi/font/css/materialdesignicons.css'

Vue.use(Buefy)

Vue.config.productionTip = false

Vue.prototype.$DISPLAYURL = process.env.VUE_APP_REAL_URL ? process.env.VUE_APP_REAL_URL : process.env.VUE_APP_URL

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
