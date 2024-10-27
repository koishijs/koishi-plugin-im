import { computed, Component, ref, Ref, MaybeRef } from 'vue'
import { Context, Dict, Service, send } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'

import Empty from './empty.vue'
import Loading from './loading.vue'

import CreateGuildScene from './create-guild.vue'
import MsgBoxScene from './msgbox.vue'

interface Lifecycle<K extends keyof Scenes> {
  onInit?: (scene: Scene[K]) => Promise<void>
  onMount?: (scene: Scene[K]) => Promise<void>
  onUnmount?: (scene: Scene[K]) => Promise<void>
}

type SceneDict<K extends keyof Scenes> = Dict<
  {
    component: Component
    aside?: Component
    handlers?: Lifecycle<K>
  },
  K
>

let startId: number = 0
const registered = {} as SceneDict<any>

export const Native = {
  MsgBoxScene,
  CreateGuildScene,
}

// TODO: better type constraints.
export interface Scenes {
  'edit-user': { user?: Im.User }
  'create-guild': void
  'msg-box': { msgs?: Array<Im.Notification> }
  search: void
}

type Scene = {
  [K in keyof Scenes]: Scene.Prototype &
    (Scenes[K] extends object ? Scenes[K] : {}) & {
      readonly lifecycles?: Lifecycle<K>
      readonly id: string
      readonly type: keyof Scenes
      readonly uid?: string
    }
}

namespace Scene {
  type ToCreate<K extends keyof Scenes> = Omit<Scene[K], 'id' | 'type' | 'lifecycles'>

  export type ID = string

  export interface Prototype {
    lifecycles?: Lifecycle<any>
    _data?: any
    avatar?: string
    brief?: MaybeRef<string>
    id?: ID
    loaded?: boolean
    pinned?: MaybeRef<boolean>
    subtitle?: string
    title: MaybeRef<string>
    type?: keyof Scenes
    uid?: string
    unread?: MaybeRef<number>
  }

  export const current = computed(() => {
    const topInstance = top()
    if (!topInstance) {
      return { ...({} as Prototype), component: Empty, aside: undefined }
    }
    if (!(topInstance as any).loaded) {
      return { ...topInstance, component: Loading, aside: undefined }
    }
    return {
      ...topInstance,
      component: registered[topInstance.type!].component,
      aside: registered[topInstance.type!].aside,
    }
  })
  export const history = ref<Array<ID>>([])
  export const mounted = ref<Dict<Prototype>>({})

  export function init() {
    history.value = []
    mounted.value = {}
  }

  export async function dispose() {
    const topInstance = top()
    const dispose = topInstance?.lifecycles?.onUnmount
    dispose
      ? dispose(topInstance).then(() => {
          topInstance.loaded = false
        })
      : Promise.resolve()
  }

  export function register<K extends keyof Scenes>(
    type: K,
    component: Component,
    aside?: Component,
    handlers?: Lifecycle<K>
  ) {
    registered[type] = { component, aside, handlers }
  }

  export async function create<K extends keyof Scenes>(
    type: K,
    data: ToCreate<K>,
    handlers?: Lifecycle<K>
  ) {
    const scene: Prototype = data
    scene.type = type
    scene.lifecycles = handlers || registered[scene.type]?.handlers || {}

    const uid = `#${scene.type}-${scene.uid}`
    if (scene.uid && mounted.value[uid]) {
      return uid
    }

    const id = scene.uid ? uid : genWindowId()
    scene.id = id
    scene.type = type
    scene.loaded = true
    scene.pinned = false

    mounted.value[id] = scene

    if (scene.lifecycles?.onInit) {
      scene.loaded = false
      await scene.lifecycles.onInit(scene)
      mounted.value[id].loaded = true
    }

    return id
  }

  export function rend(id: ID) {
    const index = history.value.findIndex((value) => value === id)
    const instance = mounted.value[id]
    const topInstance = top()

    if (!instance || (index === history.value.length - 1 && history.value.length)) {
      return
    }

    const processUnmount = topInstance?.lifecycles?.onUnmount
      ? ((topInstance.loaded = false),
        topInstance?.lifecycles.onUnmount(topInstance).then(() => {
          topInstance.loaded = true
        }))
      : Promise.resolve()

    if (index > 0) {
      history.value.splice(index, 1)
    }

    history.value.push(id)

    instance.loaded = false
    instance.lifecycles?.onMount
      ? processUnmount.then(() => {
          return instance.lifecycles?.onMount!(instance).then(() => {
            instance.loaded = true
          })
        })
      : processUnmount.then(() => {
          instance.loaded = true
        })
  }

  export function close(id: ID) {
    const index = history.value.findIndex((value) => value === id)
    if (index !== -1) {
      history.value.splice(index, 1)
    }
    delete mounted.value[id]
  }

  export function pop() {
    const id = history.value.pop()!
    delete mounted.value[id]
  }

  function top(): Prototype | undefined {
    const top = mounted.value[history.value[history.value.length - 1]]
    return top || undefined
  }

  function genWindowId(): ID {
    startId += 1 // HACK
    return startId.toString()
  }
}

export default Scene
