<template>
  <div>
    <div class="flex flex-row px-4 py-0.5 justify-end gap-2" v-if="toMe">
      <div class="flex flex-col gap-1">
        <div v-if="first" class="self-end flex flex-row items-center">
          <k-im-tag type="primary" size="small">Koishi</k-im-tag>
          <span class="font-size-3.5">name</span>
        </div>
        <div class="flex flex-row gap-2 justify-end">
          <div class="message-ts">timestamp</div>
          <div class="bubble border-rd-2 border-rd-tr-0">{{ message.content }}</div>
        </div>
      </div>
      <k-im-avatar v-if="first" size="small"></k-im-avatar>
      <div v-else></div>
    </div>
    <div class="flex flex-row p-4" v-else>
      <k-im-avatar v-if="first" size="small"></k-im-avatar>
      <div v-else></div>
      <div class="bubble border-rd-2 border-rd-tl-0">{{ message.content }}</div>
      <div class="message-ts">timestamp</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ImTypes } from '@satorijs/plugin-im'

const props = defineProps<{
  first: boolean
  message: ImTypes.Message
}>()
const first = props.first || true

const toMe = ref(true)
</script>

<style lang="scss">
.bubble {
  border: 1px solid var(--k-color-border);
  background-color: var(--k-card-bg);
  max-height: 90%;
  max-width: 60%;
  padding: 0.5rem;

  transition: border-color ease-in-out 0.1s;

  &:hover {
    border-color: var(--k-color-primary);
  }
}

.message-ts {
  align-self: flex-end;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  color: var(--k-color-disabled);
}
</style>
