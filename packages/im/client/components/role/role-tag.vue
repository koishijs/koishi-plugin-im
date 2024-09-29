<template>
  <span
    class="im-tag font-size-2.75 color-[var(--bg2)] px-0.75 py-0.25"
    :style="{ backgroundColor: `#${tag.color.toString(16)}` }"
  >
    {{ tag.name }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
}>()

const tag = computed(() => {
  if (props.title[0] === '$') {
    return alias[props.title]
  }
  return props.title
})

const alias = {
  $a: { name: '群主', color: 0xff9800 },
  $m: { name: '管理员', color: 0x009688 },
}
</script>

<style lang="scss" scoped>
.im-tag {
  border-radius: 0.25rem;
}
</style>
