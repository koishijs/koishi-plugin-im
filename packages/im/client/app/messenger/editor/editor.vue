<template>
  <div class="editor p-2">
    <div class="tool-bar-top flex flex-row self-end justify-between">
      <div class="flex flex-row items-center gap-3">
        <bot-commands></bot-commands>
      </div>
      <div class="flex flex-row items-center gap-3">
        <k-icon name="expand"></k-icon>
      </div>
    </div>
    <div class="relative p-2">
      <span v-if="isEmpty" class="absolute color-[var(--fg2)]">输入文字...</span>
      <el-scrollbar max-height="5rem">
        <div ref="editorRef" contenteditable="true" class="textarea min-h-20">
          <component
            v-for="(line, index) in lines"
            :is="line"
            :index="index"
            :atLast="index === lines.length - 1"
            class="element"
          ></component>
        </div>
      </el-scrollbar>
    </div>
    <div class="tool-bar-bottom flex flex-row self-end justify-between">
      <div class="flex flex-row items-center gap-3">
        <emoji-panel @emoji="insertEmoji">
          <k-icon name="im:emoji"></k-icon>
        </emoji-panel>
        <file-picker @add="sendFile"><k-icon name="im:image"></k-icon></file-picker>
      </div>
      <div class="flex flex-row items-center gap-3">
        <essential @confirm="resetContent"><k-icon name="im:trash-can"></k-icon></essential>
        <k-icon name="paper-plane" @click="_sendMessage"></k-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted, UnwrapRef, watch, inject, provide, VNode } from 'vue'
import { Dict, message, useContext, send } from '@cordisjs/client'
import { Editor } from './editor'
import { imMessenger } from '..'
import Scene from '../../scene'

const ctx = useContext()
const chat = ctx['im.client']

const editorRef = ref<HTMLDivElement>()

let editor: Editor | null = null

const scene = inject<UnwrapRef<Scene['chat-friend'] & Scene['chat-guild']>>('scene')

const isEmpty = ref(true)
const haveBreak = ref(false)

const lines = ref<VNode[]>([])

onMounted(() => {
  editor = new Editor(editorRef.value!)
  watch(
    () => editor?.result.value,
    async (newResult) => {
      lines.value = newResult!
      await nextTick()
      const inputEvent = new Event('input', { bubbles: true, cancelable: true })
      editorRef.value!.dispatchEvent(inputEvent)
      isEmpty.value = !(newResult && newResult.length > 0)
      haveBreak.value = editor!.raw.endsWith('\n')
    }
  )
})

async function _sendMessage() {
  const contentToSend = editor?.raw
  await sendMessage(contentToSend!)
}

async function sendMessage(content: string) {
  if (!content) {
    message.warning('消息不可为空')
    return
  }
  const payload = {
    channel: scene!.channel,
    sid: imMessenger.genTempId(),
    content: content,
    user: chat.getLogin().user,
    createdAt: new Date().getTime(),
  }
  chat.mountMessage(payload)
  resetContent()
  send('im/v1/message/create', { login: chat.getLogin(), message: payload })
}

async function sendFile(toSend: Dict<{ b64: string; type: string }>) {
  const list = Object.values(toSend)
  let content = ''
  const uploads = list.map(async (item) => {
    console.log(item)
    return send('im/v1/file-upload', { login: chat.getLogin(), b64: item.b64 }).then((path) => {
      if (item.type.startsWith('image')) {
        content += `![image](${path})`
      } else {
        content += ``
      }
    })
  })
  await Promise.all(uploads)
  sendMessage(content)
}

function insertEmoji(emoji: string) {
  editor!.insertInRaw(emoji)
}

function resetContent() {
  editor!.resetContent()
}

// HACK: temporary implementation.
provide(editor, 'editor')
</script>

<style lang="scss">
.editor {
  background-color: var(--bg2);
  border-radius: 0.5rem 0.5rem 0 0;
  border: 1px solid var(--k-color-border);
  border-bottom: none;
}

.tool-bar {
  height: 1.25rem;
  width: 100%;

  svg {
    color: var(--k-text-light);
    transition: all 0.2s;

    &:hover,
    &:focus {
      opacity: 0.7;
    }
  }

  .highlight {
    &:hover,
    &:focus {
      border-radius: 1rem;
      background-color: var(--k-color-active);
    }
  }

  &-top {
    @extend .tool-bar;
    svg {
      height: 20px;
      width: 20px;
    }
  }

  &-bottom {
    @extend .tool-bar;
    svg {
      height: 22px;
      width: 22px;
    }
  }
}

.textarea {
  height: 2rem;
  display: relative;
  &,
  * {
    white-space: break-spaces;
    word-wrap: break-word;
    word-break: break-all;

    caret-color: var(--fg1);
  }

  &:focus {
    outline: none;
    border: none;
  }

  .element {
    display: block;
    width: 100%;
  }
}
</style>
