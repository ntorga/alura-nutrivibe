import { defineBoot } from '#q-app'
import PocketBase from 'pocketbase'

const pocketbaseClient = new PocketBase('http://127.0.0.1:8090')
pocketbaseClient.autoCancellation(false)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$pb = pocketbaseClient
})

export { pocketbaseClient }
