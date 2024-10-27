import { App } from 'vue'
import Tab from './tab.vue'

export default function (app: App) {
  app.component('im-tab', Tab)
}
