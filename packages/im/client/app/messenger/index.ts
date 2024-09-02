import { Context, send } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'
import transform from './message'
import MdImage from './message/image.vue'
import MdUnknown from './message/unknown.vue'

export { default as ChatScene } from './chat.vue'

declare module '@cordisjs/client' {
  interface ActionContext {
    message: Im.Message
  }
}

class Messenger {
  private tempIdCounter: bigint = BigInt(0)
  private static _instance: Messenger

  static get instance(): Messenger {
    if (!Messenger._instance) {
      this._instance = new Messenger()
    }
    return this._instance
  }

  private constructor() {}

  rendMessage = transform

  genTempId(): string {
    this.tempIdCounter += BigInt(1)
    return this.tempIdCounter.toString()
  }
}

export const imMessenger = Messenger.instance

export default function (ctx: Context) {
  ctx.menu('message', [
    {
      id: '.copy',
      icon: 'im:copy',
      label: '复制文本',
    },
    {
      id: 'quote',
      icon: 'im:quote',
      label: '回复',
    },
    {
      id: 'share',
      icon: 'im:share',
      label: '分享',
    },
    {
      id: 'select',
      icon: 'im:check-round',
      label: '多选',
    },
    {
      id: '@separator',
    },
    {
      id: '.recall',
      icon: 'im:recall',
      label: '撤回',
    },
    {
      id: '@separator',
    },
    {
      id: '.delete',
      icon: 'delete',
      label: '删除',
    },
  ])

  ctx.inject(['im.client'], (injected) => {
    const chat = injected['im.client']
    injected.action('message.copy', ({ message }) => {
      navigator.clipboard.writeText(message.content!)
    })
    injected.action('message.quote', ({ message }) => {
      // TODO:
    })
    injected.action('message.share', ({ message }) => {
      // TODO:
    })
    injected.action('message.select', ({ message }) => {
      // TODO: select mode
    })
    injected.action('message.recall', {
      hidden: ({ message }) => {
        const me = chat.getLogin().user!
        return !(message.user!.id === me.id)
      },
      action: ({ message }) => {
        send('im/v1/message/recall', {
          login: chat.getLogin(),
          cid: message.channel!.id,
          id: message.id!,
        })
      },
    })
    injected.action('message.delete', ({ message }) => {
      // send('im/v1/message/settings')
    })
  })

  ctx.app.component('md-image', MdImage)
  ctx.app.component('md-unknown', MdUnknown)
}
