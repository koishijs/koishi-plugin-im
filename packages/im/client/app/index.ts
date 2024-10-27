import { computed, ref, Ref } from 'vue'
import { Context, send } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'
import aside, { AsideGuild, AsideUser } from './aside'
import navigation from './navigation'
import messenger, { ChatScene } from './messenger'
import user, { MyInfoScene, GlobalSearchScene } from './user'
import Scene, { Native } from './scene'

export { default as Scene, Native } from './scene'
export { default as ImApp } from './index.vue'

declare module '@cordisjs/client' {
  interface ActionContext {
    'chat-session': void
    'user-settings': void
  }
}

declare module './scene' {
  interface Scenes {
    'chat-friend': {
      messages?: Ref<Array<Im.Message>>
      friend: Im.Friend.Payload
      channel: Im.Channel
    }
    'chat-guild': { messages?: Ref<Array<Im.Message>>; guild: Im.Guild; channel: Im.Channel }
  }
}

export const inject = ['im.client']

export default function (ctx: Context) {
  ctx.plugin(user)
  ctx.plugin(aside)
  ctx.plugin(navigation)
  ctx.plugin(messenger)

  ctx.inject(['im.client'], (injected) => {
    const chat = injected['im.client']

    Scene.register('chat-friend', ChatScene, AsideUser, {
      onInit: async (scene) => {
        const messageData = await chat.getMessageData(scene.channel)
        scene.messages = ref(messageData.data)

        scene.unread = computed({
          get: () => messageData.unread,
          set: (value) => {
            send('im/v1/channel/update-settings', {
              login: chat.getLogin(),
              cid: scene.channel.id,
            })
            messageData.unread = value
          },
        })

        scene.pinned = computed({
          get: () => scene.friend.pinned || false,
          set: (value) => {
            scene.friend.pinned = value
            // TODO:
          },
        })

        const manualBrief = ref<string>('')
        scene.brief = computed({
          get: () =>
            manualBrief.value ||
            scene.messages?.value[scene.messages!.value.length - 1]?.content! ||
            '',
          set: (value) => (manualBrief.value = value),
        })
        scene.avatar = scene.friend.user.avatar
      },
      onMount: async (scene) => {
        scene.unread = -1 // HACK: cannot set unread to 0 twice.
      },
      onUnmount: async (scene) => {
        scene.unread = 0
      },
    })
    Scene.register('chat-guild', ChatScene, AsideGuild, {
      onInit: async (scene) => {
        const messageData = await chat.getMessageData(scene.channel)
        scene.messages = ref(messageData.data)

        scene.unread = computed({
          get: () => messageData.unread,
          set: (value) => {
            send('im/v1/channel/update-settings', {
              login: chat.getLogin(),
              cid: scene.channel.id,
            })
            messageData.unread = value
          },
        })

        scene.pinned = computed({
          get: () => scene.guild.settings?.[0].pinned || false,
          set: (value) => {
            if (scene.guild.settings?.[0].pinned) {
              scene.guild.settings[0].pinned = value
            }
            // TODO:
          },
        })

        const manualBrief = ref<string>('')
        scene.brief = computed({
          get: () =>
            manualBrief.value ||
            scene.messages?.value[scene.messages!.value.length - 1]?.content! ||
            '',
          set: (value) => (manualBrief.value = value),
        })

        scene.avatar = scene.guild.avatar
      },
      onMount: async (scene) => {
        scene.unread = -1 // HACK: cannot set unread to 0 twice.
      },
      onUnmount: async (scene) => {
        scene.unread = 0
      },
    })
    Scene.register('edit-user', MyInfoScene)
    Scene.register('search', GlobalSearchScene)
    Scene.register('msg-box', Native.MsgBoxScene)
    Scene.register('create-guild', Native.CreateGuildScene)
  })
}
