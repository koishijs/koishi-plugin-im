import { Context } from '@cordisjs/client'
import settings from './settings'
import Aside from './aside.vue'

export { default as AsideUser } from './aside-user.vue'
export { default as AsideGuild } from './aside-guild.vue'

export default function (ctx: Context) {
  ctx.app.component('im-aside', Aside)

  ctx.app.use(settings)
}
