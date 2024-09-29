<template>
  <k-icon ref="trigger" class="bot" name="koishi"></k-icon>
  <el-popover
    v-loading="commands"
    :virtual-ref="trigger"
    virtual-triggering
    :visable="visable"
    trigger="click"
    placement="top-start"
  >
    <el-scrollbar max-height="10rem">
      <div class="p-2 flex flex-col">
        <div
          v-for="command in commands"
          class="h-8 cursor-pointer hover:bg-[var(--bg3)]]"
          @click="handleSelect(command)"
        >
          me
        </div>
      </div>
    </el-scrollbar>
  </el-popover>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { Universal } from '@satorijs/core'
import { send, useContext } from '@cordisjs/client'

const chat = useContext()['im.client']

const trigger = ref<HTMLDivElement>()

const emit = defineEmits(['command'])

const visable = ref(false)

const commands = ref<Universal.Command[]>([])

onMounted(fetchCommands)

function fetchCommands() {
  send('im/v1/bot/fetch-commands', { login: chat.getLogin(), id: 'koishi' }).then((data) => {
    commands.value = data
  })
}

function handleSelect(item: Universal.Command) {
  emit('command', item)
  visable.value = false
}
</script>

<style lang="scss">
.bot {
  border-radius: 1rem;

  background-color: white;

  color: var(--k-color-active) !important;
}
</style>
