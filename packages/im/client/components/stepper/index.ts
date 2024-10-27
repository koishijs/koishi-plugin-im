import { App } from 'vue'
import Stepper from './stepper.vue'
import Step from './step.vue'

export { Stepper } from './step'

export default function (app: App) {
  app.component('im-stepper', Stepper)
  app.component('step-item', Step)
}
