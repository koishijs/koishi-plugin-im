import { App } from 'vue'
import aside from './aside'
import role from './role'
import list from './list'
import tab from './tab'
import windowed from './windowed'

export * from './aside'
export * from './role'
export * from './list'
export * from './tab'
export * from './windowed'

export default function (app: App) {
  app.use(aside)
  app.use(list)
  app.use(tab)
  app.use(role)
  app.use(windowed)
}
