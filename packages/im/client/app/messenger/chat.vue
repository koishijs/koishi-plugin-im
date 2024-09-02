<template>
  <div class="flex flex-col flex-1">
    <div class="flex-1 flex flex-col">
      <div v-if="!scene.messages!.length" class="flex-grow-1 flex flex-col items-center">
        <label class="p-0.5 font-size-3 color-[var(--fg3)]">发送你的第一条消息!</label>
      </div>
      <virtual-list
        v-else
        :data="scene.messages"
        max-height="calc(100vh - 16rem)"
        key-name="id"
        :active-key="top"
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
          <message-item :message="slotProps" />
        </template>
      </virtual-list>
    </div>
    <div class="input-panel flex flex-col mx-4 p-2 gap-2 grow-0 shrink-0">
      <div class="tool-bar flex flex-row self-end justify-between">
        <div class="flex flex-row items-center gap-3">
          <k-icon name="koishi" style="color: var(--k-color-active)"></k-icon>
        </div>
        <div class="flex flex-row items-center gap-3">
          <k-icon name="expand"></k-icon>
        </div>
      </div>
      <div class="im-textarea">
        <el-input
          placeholder="发送消息..."
          v-model="contentToSend"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 4 }"
          resize="none"
        ></el-input>
      </div>
      <div class="tool-bar flex flex-row self-end justify-between">
        <div class="flex flex-row items-center gap-3">
          <k-icon name="im:emoji"></k-icon>
          <file-picker v-model="fileToSend" @add="handleNewImage"
            ><k-icon name="im:image"></k-icon
          ></file-picker>
          <k-icon name="editor:bold"></k-icon>
        </div>
        <div class="flex flex-row items-center gap-3">
          <essential @confirm="resetContent"><k-icon name="im:trash-can"></k-icon></essential>
          <k-icon name="paper-plane" @click="sendMessage"></k-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUpdated, onBeforeUnmount, ref, UnwrapRef } from 'vue'
import { Dict, send, useContext, message } from '@cordisjs/client'
import { imMessenger } from '.'
import Scene from '../scene'
import { throttle } from '../../utils'
import MessageItem from './message-item.vue'

const ctx = useContext()
const chat = ctx['im.client']

const editor = ref<HTMLDivElement>()

const props = defineProps<{
  scene: UnwrapRef<Scene['chat-friend'] & Scene['chat-guild']>
}>()

const top = ref<string>('')
const contentToSend = ref<string>('')
const fileToSend = ref<Dict<string>>({})

async function sendMessage() {
  if (!contentToSend.value) {
    message.warning('消息不可为空')
    return
  }
  const payload = {
    channel: props.scene.channel,
    sid: imMessenger.genTempId(),
    content: contentToSend.value,
    user: chat.getLogin().user,
  }
  chat.mountMessage(payload)
  contentToSend.value = ''
  if (fileToSend.value) {
    const promises: Promise<string>[] = []
    Object.values(fileToSend.value).forEach((value) =>
      promises.push(send('im/v1/file-upload', { login: chat.getLogin(), b64: value }))
    )
    await Promise.all(promises)
  }
  send('im/v1/message/create', { login: chat.getLogin(), message: payload })
}

function handleNewImage(idArray: string[]) {
  let content = ''
  for (let i = 0; i < idArray.length; i++) {
    content += `/${JSON.stringify({
      name: 'image',
      src: idArray[i], // TODO:
    })};`
  }
  contentToSend.value += content
}

const handleTop = throttle(() => {
  console.log('top')
  chat.updateMessageList(props.scene.channel, 'before', props.scene.messages![0].createdAt)
})

function resetContent() {
  contentToSend.value = ''
}
</script>

<style lang="scss" scoped>
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 0;
}

:deep(.el-textarea__inner) {
  box-shadow: none;
  border: none;
}

.input-panel {
  background-color: var(--bg2);
  border-radius: 0.5rem 0.5rem 0 0;
  border: 1px solid var(--k-color-border);
  border-bottom: none;

  svg {
    color: var(--k-text-light);
    height: 22px;
    width: 22px;

    transition: all 0.2s;

    &:hover,
    &:focus {
      opacity: 0.7;
    }
  }
}

.tool-bar {
  height: 1.25rem;
  width: 100%;

  svg {
    height: 20px;
    width: 20px;
  }
}

.im-textarea {
  border: 1px solid var(--k-color-divider-dark);
  border-left: none;
  border-right: none;
}
</style>
