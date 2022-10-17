import Vue from 'vue'
//import VueRouter from 'vue-router'
import { IonicVueRouter } from '@ionic/vue';
import Home from '../views/Home.vue'
import TilesVector from '../views/TilesVector.vue'
import Callback from '../views/Callback.vue'
import NotAuthorized from '../views/NotAuthorized.vue'
import Profile from "../views/Profile.vue"
import Classification from "../views/Classification.vue"
import { authGuard } from "../utils/authGuard";
import Medals from '../views/Medals.vue';
import MedalUser from '../views/MedalUser.vue';
import UserClassification from '../views/UserClassification.vue';
import About from "../views/About.vue";
import Tutorial from "../views/Tutorial.vue";
import Shop from "../views/Shop.vue"
import Options from "../views/Options.vue"

Vue.use(IonicVueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/mytiles',
    name: 'TilesVector',
    //beforeEnter: authCheck,
    component: TilesVector,
    beforeEnter: authGuard
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    beforeEnter: authGuard
  },
  {
    path: '/classification',
    name: 'Classification',
    component: Classification,
    beforeEnter: authGuard
  },
  {
    path: '/callback',
    name: 'Callback',
    component: Callback
  },
  {
    path: "/notauthorized",
    name: "NotAuthorized",
    component: NotAuthorized,
  },
  {
    path: "/medals",
    name: "Medals",
    component: Medals,
    beforeEnter: authGuard
  },
  {
    path: "/medalclassification/:userName",
    name: "MedalUser",
    props:true,
    component: MedalUser,
    beforeEnter: authGuard
  },
  {
    path: "/userclassification/:userName",
    name: "userclassification",
    props:true,
    component: UserClassification,
    beforeEnter: authGuard
  },
  {
    path: "/about",
    name: "About",
    component: About,
    beforeEnter: authGuard
  },
  {
    path: "/tutorial",
    name: "tutorial",
    component: Tutorial,
    beforeEnter: authGuard
  },
  {
    path: "/shop",
    name: "shop",
    component: Shop,
    beforeEnter: authGuard
  },
  {
    path:"/options",
    name: "options",
    component: Options,
    beforeEnter: authGuard
  }
]

const router = new IonicVueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
export default router
