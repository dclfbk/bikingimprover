import Vue from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import App from './App.vue'
import router from './router'
import Ionic from '@ionic/vue';
import '@ionic/core/css/ionic.bundle.css';
//import 'vue-material/dist/theme/default.css'//QUESTO VA A MODIFICARMI ANCHE IUL BOTTOM MENU!
import { MdButton, MdContent, MdTabs } from 'vue-material/dist/components'
//import the css description
import "@/assets/css/global.css"
// Import the plugin here
import { Auth0Plugin } from "./utils/auth.js";

import './registerServiceWorker'

import GetTextPlugin from "vue-gettext"
import translations from "./utils/translations.js"


Vue.use(GetTextPlugin,{
  availableLanguages: {
    English: 'English',
    Italiano: 'Italiano',
  },
  languageVmMixin: {
    computed: {
      currentKebabCase: function () {
        return this.current.toLowerCase().replace('_', '-')
      },
    },
  },
  defaultLanguage: 'English',
  translations: translations,
  silent:true
})

// Install the authentication plugin here
Vue.use(Auth0Plugin, {
  domain: window.AUTH0_DOMAIN,
  clientId: window.AUTH0_CLIENT_ID,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    );
  }
});

Vue.prototype.$api_url = "http://localhost:8080";
Vue.prototype.$currentLanguage = "English"

Vue.use(VueMaterial)
Vue.use(Ionic);
Vue.config.productionTip = false
Vue.use(MdButton)
Vue.use(MdContent)
Vue.use(MdTabs)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
