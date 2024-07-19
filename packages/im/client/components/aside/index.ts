import { App } from 'vue'
import Aside from './aside.vue'

export default function (app: App) {
  app.component('k-im-aside', Aside)
}
