export type StepCallback = (data: any) => any

export namespace Step {
  export type Status = 'inactive' | 'active' | 'completed'
}

export class Stepper {
  data: any = {}
  steps: Array<StepCallback> = []
  index: number = 0

  addStep(callback: (data: any) => any) {
    this.steps.push(callback)
  }

  submit() {
    this.steps[this.steps.length - 1](this.data)
  }

  next() {
    if (this.index < this.steps.length - 1) {
      if (this.index) {
        this.data = this._execute()
      }
      this.index++
    }
  }

  prev() {
    if (this.index > 0) {
      this.index--
    }
  }

  hasNext() {
    return this.index < this.steps.length - 1
  }

  hasPrev() {
    return this.index > 0
  }

  private _execute() {
    if (this.steps[this.index]) {
      return this.steps[this.index](this.data)
    }
    return this.data
  }
}
