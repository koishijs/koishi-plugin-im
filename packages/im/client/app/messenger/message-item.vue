<template>
  <div>
    <div class="flex flex-row px-4 py-1 justify-end gap-2" v-if="fromMe">
      <div class="flex flex-col gap-1">
        <div v-if="first" class="self-end flex flex-row items-center gap-0.5">
          <im-tag
            v-if="hasRole()"
            :color="`#${message.member.roles[0].color}`"
            :title="message.member.roles[0].name"
          ></im-tag>
          <label>{{ sender.name }}</label>
        </div>
        <div class="flex flex-row gap-2 justify-end">
          <div v-if="message.sid" class="message-ts">发送中...</div>
          <div v-else class="message-ts">{{ formatTimestamp(message.createdAt!) }}</div>
          <div
            ref="bubble"
            class="bubble border-rd-2 border-rd-tr-0 flex justify-center font-size-4"
            @contextmenu.stop="triggerMessageMenu($event, message)"
          >
            <component :is="h('p', content)"></component>
          </div>
        </div>
      </div>
      <im-avatar v-if="first" :name="sender.name" size="small"></im-avatar>
      <div v-else></div>
    </div>
    <div class="flex flex-row px-4 py-1 gap-2" v-else>
      <im-avatar v-if="first" :name="sender.name" size="small"></im-avatar>
      <div v-else></div>
      <div class="flex flex-col gap-1">
        <div v-if="first" class="self-start flex flex-row items-center gap-0.5">
          <im-tag
            v-if="hasRole()"
            :color="`#${message.member.roles[0].color}`"
            :title="message.member.roles[0].name"
          ></im-tag>
          <label>{{ sender.name }}</label>
        </div>
        <div class="flex flex-row gap-2 justify-end">
          <div
            ref="bubble"
            class="bubble border-rd-2 border-rd-tl-0 font-size-4"
            @contextmenu.stop="triggerMessageMenu"
          >
            <component :is="h('p', content)"></component>
          </div>
          <div class="message-ts">{{ formatTimestamp(message.createdAt!) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults, getCurrentInstance, ref, h } from 'vue'
import { useContext, useMenu } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'
import { formatTimestamp } from '../../utils'
import t from './message'

const ctx = useContext()
const chat = ctx['im.client']
const instance = getCurrentInstance()!
const bubble = ref<HTMLDivElement>()

const props = withDefaults(
  defineProps<{
    first: boolean
    message: Im.Message
  }>(),
  {
    first: true,
  }
)

const triggerMessageMenu = useMenu('message')

const content = computed(() => {
  const result = t(props.message.content!)
  instance.proxy!.$forceUpdate()
  return result
})

const sender = computed(() => {
  return props.message.user!
})

const fromMe = computed(() => {
  return props.message.user!.id === chat.getLogin().user!.id
})

function hasRole() {
  return props.message.member && props.message.member.roles && props.message.member.roles.length > 0
}
</script>

<style lang="scss">
.bubble {
  border: 1px solid var(--k-color-border);
  background-color: var(--k-card-bg);
  max-width: 60%;
  min-width: 0.5rem;
  padding: 0.25rem 0.5rem;

  transition: border-color ease-in-out 0.1s;

  &:hover {
    border-color: var(--k-color-primary);
  }

  p {
    margin: 0;
  }
}

.message-ts {
  align-self: flex-end;
  font-size: 0.625rem;
  margin-bottom: 0.25rem;
  color: var(--k-color-disabled);
}
</style>
