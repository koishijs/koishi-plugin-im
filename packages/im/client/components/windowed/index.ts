import { App, defineComponent } from 'vue'
import MessageWindow from './message-window.vue'

export default function (app: App) {
  app.component('k-im-window-message', MessageWindow)
}
