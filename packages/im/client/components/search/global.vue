<!-- TODO: migrate to selector -->
<template>
  <div class="flex flex-col gap-2">
    <slot name="header"></slot>
    <el-scrollbar>
      <div
        v-for="item in page.data"
        class="item flex flex-col"
        :class="{ active: isSelected(item) }"
        @click="handleSelect(item)"
      >
        <slot v-bind="{ item, type }"></slot>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, reactive, watch, onMounted } from 'vue'
import { send, useContext } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'
import { debounce } from '../../utils'

const chat = useContext()['im.client']

const selected = defineModel<any>()

const props = defineProps<{
  type: string
  keyword: string
}>()

const page = reactive<Im.ChunkData>({
  current: 1,
  total: 1,
  data: [],
})
const loaded = ref<boolean>(true)

onMounted(() => {
  watch(
    () => props.keyword,
    debounce(async (keyword) => {
      const data = await fetchPage(props.type as any, keyword)
      page.data = data!
      loaded.value = true
    }, 500)
  )
})

function isSelected(item: Im.User) {
  return selected.value === item
}

function handleSelect(item: Im.User) {
  selected.value === item ? (selected.value = null) : (selected.value = item)
}

async function fetchPage(
  type: 'user' | 'guild',
  keyword: string,
  direction: 'before' | 'after' = 'after',
  cursorId: string = '#begin'
) {
  if (!keyword.trim()) return
  loaded.value = false
  return send(`im/v1/search/${type}`, {
    login: chat.getLogin(),
    keyword,
    options: {
      direction,
      cursor: cursorId,
      limit: 10,
      except: [chat.getLogin().selfId!],
    },
  })
}
</script>

<style lang="scss" scoped>
.item {
  transition: all 0.3s ease-in-out;

  border: 2px solid transparent;

  &.active {
    border-left: 2px solid var(--k-color-active);
  }
}
</style>
