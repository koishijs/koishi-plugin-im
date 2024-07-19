import { reactive } from 'vue'
import { Context, Dict } from '@cordisjs/client'
import HTTP from '@cordisjs/plugin-http'
import Satori, { Bot, Universal } from '@satorijs/core'

import 'virtual:uno.css'

import install from './components'
import IMClient from './index.vue'

declare module '@cordisjs/client' {
  interface Context {}
}

interface CachedLogin {
  user: Bot
  login: Universal.Login | null
}

interface CachedData {
  guilds: Universal.Guild[]
  friends: Universal.User[]
}

export default (ctx: Context) => {
  let loginUser = reactive<Dict<CachedLogin>>({})
  ctx.plugin(HTTP)
  ctx.plugin(Satori)

  ctx.app.use(install)
  ctx.page({
    name: 'IM-test',
    path: '/im',
    icon: 'activity:chat',
    component: IMClient,
  })
}
