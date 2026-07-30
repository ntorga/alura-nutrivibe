import { defineBoot } from "#q-app";
import PocketBase from "pocketbase";

const pocketbaseClient = new PocketBase("/");
pocketbaseClient.autoCancellation(false);

export default defineBoot(({ app }) => {
  app.config.globalProperties.$pb = pocketbaseClient;
});

export { pocketbaseClient };
