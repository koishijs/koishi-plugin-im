<template>
  <div class="im-tab flex">
    <label
      v-for="(item, index) in data"
      :key="index"
      class="flex justify-center items-center relative"
      :class="{ active: current === index }"
      :style="{ flexGrow: item.grow || 1 }"
      @click="handleSelect(index)"
      ref="tabRefs"
    >
      <k-icon v-if="item.icon" :name="item.icon"></k-icon>
      {{ item.label }}
    </label>
    <div class="active-bar" :style="locator"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'

const emit = defineEmits(['item-click'])
const current = defineModel<number>({ default: 0 })

const props = defineProps<{
  data: Array<{
    label?: string
    icon?: string
    grow?: number
  }>
}>()

onMounted(() => {
  nextTick(() => {
    current.value = current.value
  })
}) // debounce

const tabRefs = ref<HTMLElement[]>([])

const locator = computed(() => {
  const element = tabRefs.value[current.value]
  return element
    ? {
        transform: `translateX(${element.offsetLeft}px)`,
        width: `${element.offsetWidth}px`,
      }
    : {}
})

function handleSelect(index: number) {
  current.value = index
  emit('item-click', index)
}
</script>

<style scoped lang="scss">
.im-tab {
  overflow: hidden;
  position: relative;

  label {
    text-align: center;
    padding: 10px 0;
    cursor: pointer;
    transition: all 0.1s ease-out;

    &:hover {
      opacity: 0.8;
    }

    &.active {
      color: var(--k-color-active);
    }
  }

  .active-bar {
    position: absolute;
    bottom: 0;
    height: 2px;
    background-color: var(--k-color-active);
    transition: transform 0.3s ease, width 0.3s ease;
  }
}
</style>
