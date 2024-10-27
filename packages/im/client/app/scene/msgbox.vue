<template>
  <k-content>
    <el-scrollbar>
      <div class="flex-1 flex flex-col">
        <div v-for="item in scene.msgs">
          <div
            class="b-rd-1 b-1px b-solid b-[var(--k-color-divider)] min-h-20 p-4 gap-2 flex flex-col bg-[var(--bg2)]"
          >
            <div class="flex flex-row gap-2 items-center">
              <im-avatar size="small" :user="(item as any).self"></im-avatar>
              <span>{{ getDisplayName((item as any).self) }}</span>
            </div>
            <text v-if="notType(item) === 'new-friend'">希望添加你为好友</text>
            <text v-else-if="notType(item) === 'new-guild'">希望你加入{{ item.guild?.name }}</text>
            <text v-if="item.content" class="p-2 bg-[var(--bg1)]">{{ item.content }}</text>
            <div
              v-if="notType(item) !== 'notification'"
              class="flex flex-row items-center justify-end gap-4"
            >
              <k-icon
                name="im:close"
                class="h-5 w-5 hover:color-[var(--k-color-danger)]"
                @click="refuse(item)"
              ></k-icon>
              <k-icon
                name="check"
                class="h-5 w-5 hover:color-[var(--k-color-success)]"
                @click="accept(item)"
              ></k-icon>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </k-content>
</template>

<script setup lang="ts">
import { send, useContext, message } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'
import Scene from '../scene'
import { getDisplayName } from '../user'
import { lockdown } from '../../utils'

const chat = useContext()['im.client']

const props = defineProps<{
  scene: Scene['msg-box']
}>()

const accept = lockdown((item: Im.Notification) => {
  if (!item.shouldReply) return
  send('im/v1/invitation/reply', { login: chat.getLogin(), nid: item.id, reply: true })
    .then(() => {
      const index = props.scene.msgs!.findIndex((value) => value.id === item.id)
      if (index !== -1) {
        props.scene.msgs!.slice(index, 1)
      }
    })
    .catch(() => {
      message.error('确认失败')
    })
})

const refuse = lockdown((item: Im.Notification) => {
  if (!item.shouldReply) return
  send('im/v1/invitation/reply', { login: chat.getLogin(), nid: item.id, reply: false })
    .then(() => {
      const index = props.scene.msgs!.findIndex((value) => value.id === item.id)
      if (index !== -1) {
        props.scene.msgs!.slice(index, 1)
      }
    })
    .catch(() => {
      message.error('确认失败')
    })
})

function notType(not: Im.Notification) {
  if (!not.shouldReply) return 'notification'
  if (not.guild?.id) return 'new-guild'
  return 'new-friend'
}
</script>
