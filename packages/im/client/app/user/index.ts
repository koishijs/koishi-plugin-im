import { Context } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'
import Login from './login-form.vue'

export { default as MyInfoScene } from './my-info.vue'
export { default as GlobalSearchScene } from './search.vue'

export function getDisplayName(user: Im.User, friend?: { name: string }, member?: Im.Member) {
  let expr = user.nick || user.name
  if (member) {
    expr = member.nick || member.name || expr
  }
  if (friend) {
    expr = friend.name || expr
  }
  return expr!
}

export default function (ctx: Context) {
  ctx.app.component('im-login', Login)
}
