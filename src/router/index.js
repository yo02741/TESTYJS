import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    {
      path: "/:pathMatch(.*)",
      redirect: "/",
    },
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/TheHome.vue"),
    },
    {
      path: "/patient/:chart",
      name: "Patient",
      component: () => import("@/components/ThePatient.vue"),
    }
  ],
});

export default router;
