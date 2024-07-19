import { App } from 'vue'
import Avatar from './avatar.vue'
import Login from './login-form.vue'
import Tag from './role-tag.vue'

export default function (app: App) {
  app.component('k-im-avatar', Avatar)
  app.component('k-im-login', Login)
  app.component('k-im-tag', Tag)
}
