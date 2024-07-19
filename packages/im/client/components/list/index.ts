import { App } from 'vue'
import ChatList from './chat-list.vue'
import MessageList from './message-list.vue'

export default function (app: App) {
  app.component('k-im-chat-list', ChatList)
  app.component('k-im-message-list', MessageList)
}
