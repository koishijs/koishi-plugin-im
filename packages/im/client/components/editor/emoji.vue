<template>
  <div ref="trigger" class="flex"><slot></slot></div>
  <el-popover
    :virtual-ref="trigger"
    virtual-triggering
    :visable="visable"
    trigger="click"
    placement="top-start"
    popper-style="width: 15rem;"
  >
    <el-scrollbar max-height="10rem">
      <div class="p-2 grid grid-cols-6 auto-rows-fr">
        <div
          v-for="emoji in emojis"
          class="w-8 h-8 font-size-5 cursor-pointer hover:bg-[var(--bg3)]]"
          @click="handleSelect(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </el-scrollbar>
  </el-popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const trigger = ref<HTMLDivElement>()

const emit = defineEmits(['emoji'])

const emojis = getEmojiSequence(0x1f600, 0x1f64f)

const visable = ref(false)

function getEmojiSequence(start: number, end: number) {
  let emojis: string[] = []
  for (let i = start; i <= end; i++) {
    emojis.push(String.fromCodePoint(i))
  }
  return emojis
}

function handleSelect(item: string) {
  emit('emoji', item)
  visable.value = false
}
</script>

<style lang="scss"></style>
