import { App } from 'vue'
import { Context } from '@cordisjs/client'
import role from './role'
import stepper from './stepper'
import tab from './tab'
import Divider from './divider.vue'
import Essential from './essential.vue'
import { FilePicker } from './fs'
import Form from './form/form.vue'
import FormItem from './form/item.vue'
import More from './more.vue'
import Search from './search/global.vue'

export * from './fs'
export * from './stepper'
export * from './tab'
export * from './role'

export default function apply(ctx: Context) {
  ctx.app.component('file-picker', FilePicker)
  ctx.app.component('essential', Essential)
  ctx.app.component('more', More)
  ctx.app.component('im-search', Search)
  ctx.app.component('im-divider', Divider)
  ctx.app.component('im-form', Form)
  ctx.app.component('im-form-item', FormItem)

  ctx.app.use(tab)
  ctx.app.use(stepper)
  ctx.plugin(role)
}
