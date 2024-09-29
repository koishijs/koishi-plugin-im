<template>
  <div class="flex flex-col flex-1">
    <div class="flex-1 flex flex-col">
      <div v-if="!scene.messages!.length" class="flex-grow-1 flex flex-col items-center">
        <label class="p-0.5 font-size-3 color-[var(--fg3)]">发送你的第一条消息!</label>
      </div>
      <virtual-list
        v-else
        :data="mergedMessages"
        max-height="calc(100vh - 16rem)"
        key-name="id"
        :active-key="anchor"
        :pinned="true"
        threshold="200"
        @top="handleTop"
      >
        <template #header>
          <div class="flex-grow-1 flex flex-col items-center">
            <label class="font-size-3 color-[var(--fg3)]">消息顶部</label>
          </div>
        </template>
        <template #default="slotProps">
          <message-item :span="slotProps" />
        </template>
      </virtual-list>
    </div>
    <div class="mx-4">
      <im-editor></im-editor>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref, UnwrapRef, computed, watch } from 'vue'
import { useContext, message } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'
import Scene from '../scene'
import { throttle } from '../../utils'
import { ImEditor } from './editor'
import MessageItem from './message-item.vue'

const ctx = useContext()
const chat = ctx['im.client']

const props = defineProps<{
  scene: UnwrapRef<Scene['chat-friend'] & Scene['chat-guild']>
}>()

provide('scene', props.scene)

const anchor = ref<string>('')

const mergedMessages = computed(() => {
  const messages = props.scene.messages
  const result: Im.CombinedMessages[] = []
  const MAX_LENGTH = 5
  const TIME_SPAN = 5 * 60 * 1000

  messages!.forEach((msg) => {
    const last = result[result.length - 1]

    const existing =
      last &&
      last.user.id === msg.user!.id &&
      last.messages.length < MAX_LENGTH &&
      msg.createdAt! - last.lastTimestamp <= TIME_SPAN
        ? last
        : undefined

    if (existing) {
      existing.messages.push(msg)
      existing.lastTimestamp = msg.createdAt!
    } else {
      result.push({
        user: msg.user!,
        member: msg.member!,
        roles: msg.member?.roles as any,
        messages: [msg],
        lastTimestamp: msg.createdAt!,
      })
    }
  })

  return result
})
// watch(
//   () => props.scene.messages!,
//   (newValue) => {
//     anchor.value = newValue[newValue.length - 1].id!
//   }
// )

const handleTop = throttle(() => {
  console.log('top')
  chat.updateMessageList(props.scene.channel, 'before', props.scene.messages![0].createdAt)
})
</script>
