import { Context } from '@cordisjs/client'
import Avatar from './avatar.vue'
import Tag from './role-tag.vue'
import UserSelector from './selector.vue'
import TinyUserSelector from './selector-tiny.vue'

export default function (ctx: Context) {
  ctx.app.component('im-avatar', Avatar)
  ctx.app.component('im-tag', Tag)
  ctx.app.component('user-selector', UserSelector)
  ctx.app.component('tiny-selector', TinyUserSelector)
}
