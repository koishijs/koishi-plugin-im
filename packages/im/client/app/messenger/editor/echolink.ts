import { Dict } from '@cordisjs/client'

type KeyCallback = (event: KeyboardEvent) => void
type InputCallback = (event: InputEvent) => void

interface Combo {
  ctrl: boolean
  alt: boolean
  key: string
}

interface Hold {
  duration: number
  key: string
}

// TODO:
class EchoLink {
  private keyDownCallbacks: Dict<KeyCallback> = {}
  private keyUpCallbacks: Dict<KeyCallback> = {}
  private keyHoldCallbacks: Dict<KeyCallback> = {}
  private keyComboCallbacks: Dict<KeyCallback> = {}
  private beforeInputCallback: Dict<InputCallback> = {}
  private inputCallback: InputCallback = () => {}
  private ordinaryCallbacks: Dict<KeyCallback> = {}

  private _isMonitoring = false
  private _noSpread = false
  private _noDefault = false

  get input() {
    return this._handleInput
  }

  get keydown() {
    return this._handleKeydown
  }

  get keyup() {
    return this._handleKeyup
  }

  constructor(private target: HTMLElement) {}

  start(name?: string) {
    if (name === 'beforeinput') {
      this.target.addEventListener('beforeinput', this._beforeInput)
      return
    }

    if (!this._isMonitoring) {
      this.target.addEventListener('keydown', this._handleKeydown)
      this.target.addEventListener('beforeinput', this._beforeInput)
      this.target.addEventListener('input', this._handleInput as any)
      this.target.addEventListener('keyup', this._handleKeyup)
      this._isMonitoring = true
      console.log('EchoLink activated.')
    }
  }

  stop(name: string, type?: string) {
    if (name === 'beforeinput') {
      this.target.removeEventListener('beforeinput', this._beforeInput)
      return
    }

    this.target.removeEventListener('keydown', this._handleKeydown)
    this.target.removeEventListener('beforeinput', this._beforeInput)
    this.target.removeEventListener('input', this._handleInput as any)
    this.target.removeEventListener('keyup', this._handleKeyup)
    this._isMonitoring = false
    console.log('EchoLink deactivated.')
  }

  getKey(key: string) {
    return {
      down: this.keyDownCallbacks[key],
      up: this.keyUpCallbacks[key],
      hold: this.keyHoldCallbacks[key],
    }
  }

  on(name: string, callback: (...args: any[]) => any) {
    this.ordinaryCallbacks[name] = callback
  }

  onBeforeInput(type: string, callback: InputCallback) {
    this.beforeInputCallback[type] = callback
  }

  onInput(callback: InputCallback) {
    this.inputCallback = callback
  }

  onKeyDown(key: string, callback: KeyCallback) {
    this.keyDownCallbacks[key] = callback
  }

  onKeyUp(key: string, callback: KeyCallback) {
    this.keyUpCallbacks[key] = callback
  }

  onKeyHold(key: string, callback: KeyCallback) {
    this.keyHoldCallbacks[key] = callback
  }

  onCombo(keys: string[], callback: KeyCallback) {
    const comboKey = this.generateComboKey(keys)
    this.keyComboCallbacks[comboKey] = callback
  }

  generateComboKey(keys: string[]): string {
    return keys.sort().join('+')
  }

  _handleKeydown = (event: KeyboardEvent) => {
    const key = event.key
    const callback = this.keyDownCallbacks[key]
    if (callback) {
      callback(event)
    }
  }

  _handleKeyup = (event: KeyboardEvent) => {
    const key = event.key
    const callback = this.keyUpCallbacks[key]
    if (callback) {
      callback(event)
    }
  }

  _handleInput = (event: InputEvent) => {
    if (this._noSpread) {
      event.stopPropagation()
    }
    if (this._noDefault) {
      event.preventDefault()
    }

    this.inputCallback(event)
  }

  _beforeInput = (event: InputEvent) => {
    const callback = this.beforeInputCallback[event.inputType] || this.beforeInputCallback['*']

    if (callback) {
      callback(event)
    }
  }
}

export default EchoLink
