// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import moment from "moment"
import fr from "moment/dist/locale/fr"
import makeStore from './store'
let config = {}

if (typeof activations != 'undefined') {
  config = JSON.parse(activations.innerHTML)
} 
let lang = 'en'
if (config.lang) {
  lang = config.lang
} 
if (lang === 'fr') {
  moment.locale('fr')
} else {
  moment.locale('en')
}
const store = makeStore(config)
const app = createApp(App)

app.use(router)
app.use(store)
app.mount('#app')
