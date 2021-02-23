import Vue from "vue";
import VueRouter from "vue-router";
// import Home from "../views/Home.vue";
// import Login from "../views/login/index.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "login"
    // name: "Home",
    // component: Home
  },
  {
    path: "/login",
    name: "Login",
    // component: Login
    component: () => import("../views/login/index.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
