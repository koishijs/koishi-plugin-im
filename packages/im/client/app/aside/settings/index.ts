import { App } from 'vue'
import Collapse from './collapse.vue'
import Form from './form.vue'
import Input from './input.vue'
import Select from './selector.vue'
import Switch from './switch.vue'

export default function (app: App) {
  app.component('settings-collapse', Collapse)
  app.component('settings-form', Form)
  app.component('settings-input', Input)
  app.component('settings-select', Select)
  app.component('settings-switch', Switch)
}
