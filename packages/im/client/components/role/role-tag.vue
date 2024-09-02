<template>
  <label
    class="im-tag font-size-2.75 color-[var(--bg2)] px-0.5 py-0.1"
    :style="{ backgroundColor: `#${color.toString(16)}` }"
  >
    {{ tagName }}
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  // color: number
  title: string
}>()

const bgColor = 0x39c5bb
const color = 0x39c5bb

const tagName = computed(() => {
  if (props.title[0] === '$') {
    return alias[props.title]
  }
  return props.title
})

const alias = {
  $a: '群主',
  $m: '管理',
}
</script>

<style lang="scss" scoped>
.im-tag {
  border-radius: 0.25rem;
}
</style>
