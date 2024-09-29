<template>
  <div ref="bubble" class="bubble" @contextmenu.stop="triggerMessageMenu($event, message)">
    <div class="flex flex-col">
      <component v-for="paragraph in content" :is="paragraph"></component>
    </div>
    <div v-if="message.sid && fromMe" class="timestamp">发送中...</div>
    <div v-else class="timestamp">{{ formatTimestampBySpan(message.createdAt!) }}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { useMenu } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'
import { formatTimestampBySpan } from '../../utils'
import t from './message'

const bubble = ref<HTMLDivElement>()
const instance = getCurrentInstance()!

const props = defineProps<{
  fromMe: boolean
  message: Im.Message
}>()

const content = computed(() => {
  const result = t(props.message.content!)
  instance.proxy!.$forceUpdate()
  return result
})

const triggerMessageMenu = useMenu('message')
</script>

<style lang="scss">
.bubble {
  border: 1px solid var(--k-color-border);
  border-radius: 8px;
  border-top-left-radius: 0;
  background-color: var(--k-card-bg);

  min-width: 0.5rem;
  padding: 0.25rem 0.5rem;

  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 0.5rem;

  font-size: 1rem;

  white-space: pre-wrap;
  word-wrap: break-word;

  transition: border-color ease-in-out 0.1s;

  &:focus {
    border-color: var(--k-color-active);
  }

  p {
    margin: 0;
  }
}
</style>
