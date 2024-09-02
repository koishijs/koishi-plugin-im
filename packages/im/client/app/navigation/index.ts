import { Context } from '@cordisjs/client'
import Scene from '../scene'
export { default as ImNavigation } from './list.vue'

declare module '@cordisjs/client' {
  interface ActionContext {
    'new-chat': void
    session: Scene.Prototype
  }
}

export default function (ctx: Context) {
  ctx.menu('new-chat', [
    {
      id: '.add',
      icon: 'add',
      label: '新好友/群聊',
    },
    {
      id: '.create-guild',
      icon: 'im:group',
      label: '创建群聊',
    },
  ])

  ctx.menu('session', [
    {
      id: '.pin',
      icon: 'im:pin',
      label: '置顶',
    },
    {
      id: '.unpin',
      icon: 'im:pin',
      label: '取消置顶',
    },
    {
      id: '.readed',
      icon: 'im:readed',
      label: '设置已读',
    },
    {
      id: '@separator',
    },
    {
      id: '.close',
      icon: 'close',
      label: '关闭此会话',
    },
  ])

  // FIXME: 在执行 Scene.close 时，menu 组件似乎未销毁。
  // 这导致了 hidden 会在（大约）菜单消失时访问到一个为假值的 session。
  // 目前在 hidden 加入链式访问操作符，保证安全访问。
  ctx.action('session.pin', {
    hidden: ({ session }) => {
      return !!session?.pinned
    },
    action: ({ session }) => {
      session.pinned = true
    },
  })
  ctx.action('session.unpin', {
    hidden: ({ session }) => {
      return !session?.pinned
    },
    action: ({ session }) => {
      session.pinned = false
    },
  })
  ctx.action('session.readed', {
    hidden: ({ session }) => {
      return session?.id === Scene.current.value.id
    },
    action: ({ session }) => {
      session.unread = 0
    },
  })
  ctx.action('session.close', ({ session }) => {
    // HACK: fake implementation.
    // In fact, im just initializes sessions from the past 12 weeks.

    Scene.close(session.id!)
  })
}
