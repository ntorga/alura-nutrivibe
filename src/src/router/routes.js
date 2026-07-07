const routes = [
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("@/pages/HomePage.vue") },
      { path: "add", component: () => import("@/pages/AddMealPage.vue") },
      { path: "history", component: () => import("@/pages/MealHistoryPage.vue") },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("@/pages/ErrorNotFound.vue"),
  },
];

export default routes;
