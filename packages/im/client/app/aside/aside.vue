<template>
  <div v-loading="!loaded" class="flex flex-col">
    <div class="py-2 px-4 flex justify-between items-center h-6" v-show="stack.length > 0">
      <!-- TODO: centralize elems at y axis -->
      <div
        class="flex flex-row gap-2 items-center hover:color-[var(--fg3)] cursor-pointer"
        @click="closeAside"
      >
        <k-icon name="chevron-left"></k-icon>
        <span class="color-[var(--fg2)] font-size-3.25">上一页</span>
      </div>
    </div>
    <div class="flex-1">
      <el-scrollbar>
        <component :is="current"></component>
      </el-scrollbar>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, useSlots } from 'vue'

const emit = defineEmits(['fold', 'ready', 'dispose'])

const slots = useSlots()

const stack = ref<string[]>([])
const loaded = ref<boolean>(true)

const current = computed(() => {
  const slotName = stack.value[stack.value.length - 1]
  return slotName ? slots[slotName] : slots.default
})

async function rendWindow(name: string, before?: () => any) {
  if (!stack.value.includes(name)) {
    stack.value.push(name)
  }
  if (before) {
    loaded.value = false
    await before()
  }
  loaded.value = true
}

function closeAside() {
  stack.value.pop()
}

defineExpose({ rendWindow })
</script>
