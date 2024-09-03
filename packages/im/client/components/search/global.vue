<template>
  <div class="flex flex-col gap-2">
    <slot name="header"></slot>
    <el-scrollbar>
      <div
        v-for="item in page.data"
        class="item flex flex-row items-center"
        :class="{ active: isSelected(item) }"
        @click="handleSelect(item)"
      >
        <slot v-bind="{ item, type }"></slot>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, reactive, watch } from 'vue'
import { send, useContext, MaybeArray } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'
import { debounce } from '../../utils'

const chat = useContext()['im.client']

const selected = defineModel<MaybeArray<any>>({ default: [] })

const props = defineProps<{
  type: string
  keyword: string
  selectMode: 'single' | 'multiple'
}>()

const page = reactive<Im.ChunkData>({
  current: 1,
  total: 1,
  data: [],
})
const loaded = ref<boolean>(true)

const except = computed(() =>
  (Array.isArray(selected.value) ? selected.value : [selected.value]).map((value) => value.id)
)

watch(
  () => props.keyword,
  (keyword) =>
    debounce(() => {
      fetchPage(props.type as any, keyword).then((data) => {
        page.data = data!
        loaded.value = true
      })
    }, 500)
)

function isSelected(item: Im.User) {
  if (props.selectMode === 'multiple') {
    return Array.isArray(selected.value) && selected.value.includes(item)
  } else {
    return selected.value === item
  }
}

function handleSelect(item: Im.User) {
  if (props.selectMode === 'multiple') {
    const newValue = Array.isArray(selected.value) ? [...selected.value] : []
    const index = newValue.indexOf(item)
    if (index > -1) {
      newValue.splice(index, 1)
    } else {
      newValue.push(item)
    }
    selected.value = newValue
  } else {
    selected.value === item ? (selected.value = null) : (selected.value = item)
  }
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
      except: [...except.value, chat.getLogin().selfId],
    },
  }).then()
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
