<template>
  <!-- TODO -->
  <div class="flex h-full">
    <div v-if="messageItems.length"></div>
    <div v-else class="flex flex-col flex-1">
      <div class="grow-1 shrink-1">
        <k-im-message-list />
      </div>
      <div
        class="bg-color-white flex flex-col h-24 border-rd-4 justify-center gap-1 p-4 grow-1 shrink-0"
      >
        <div class="flex flex-row gap-2">
          <span>Koishi</span>
          <span>Koishi</span>
          <span>Koishi</span>
          <span>Koishi</span>
        </div>
        <div>
          <el-input
            class="message-input"
            placeholder="发送消息..."
            v-model="current"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            :resize="false"
          ></el-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@satorijs/plugin-im-database'

const current = ref<string>('')

const messageItems = ref<Array<Message>>([])

function getMessageList() {}
</script>

<style lang="scss">
.message-input {
  :deep(.el-textarea__inner:focus) {
    border: inherit !important;
    outline: none;
  }
}
</style>
