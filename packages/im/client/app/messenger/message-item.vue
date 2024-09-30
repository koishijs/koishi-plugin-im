<template>
  <div class="message px-4 py-1 gap-2" :class="{ 'from-me': fromMe }">
    <im-avatar :user="sender" size="small"></im-avatar>
    <div class="content gap-1">
      <div class="flex flex-row items-center gap-0.5">
        <im-tag
          v-if="hasRole()"
          :color="`#${span.roles[0]?.color}`"
          :title="span.roles[0]?.name"
        ></im-tag>
        <label>{{ sender.name }}</label>
      </div>
      <bubble v-for="message in span.messages" :message="message" :from-me="fromMe"></bubble>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useContext } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'

import bubble from './bubble.vue'

const ctx = useContext()
const chat = ctx['im.client']

const props = defineProps<{
  span: Im.CombinedMessages
}>()

const sender = computed(() => props.span.user!)

const fromMe = computed(() => {
  return props.span.user!.id === chat.getLogin().user!.id
})

function hasRole() {
  return props.span.member?.roles
}
</script>

<style lang="scss">
.message {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 60%;

  .timestamp {
    align-self: flex-end;
    font-size: 0.625rem;
    color: var(--k-color-disabled);
  }
}

.from-me {
  &.message {
    flex-direction: row-reverse;
  }

  .content {
    align-items: flex-end;
  }

  .bubble {
    border-top-left-radius: 8px;
    border-top-right-radius: 0;
    flex-direction: row-reverse;
  }
}
</style>
