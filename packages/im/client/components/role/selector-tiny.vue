<template>
  <div v-loading="!loaded" class="p-1 flex flex-col w-full min-h-10">
    <el-scrollbar>
      <div
        v-for="value in filtered"
        class="item h-5 p-2 flex flex-col"
        @click="handleSelect(value)"
      >
        <div class="flex flex-row gap-1 items-center select-none">
          <im-avatar size="tiny" :user="value.user"></im-avatar>
          <span>{{ value.user.name }}</span>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useContext } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'

type SelectItem = Im.Member | Im.Friend.Payload

const chat = useContext()['im.client']

const emit = defineEmits(['select'])

const props = defineProps<{
  type: 'friend' | 'member'
  except: string[]
  gid?: string
  keyword: string
}>()

const loaded = ref(false)

const options = ref<Array<SelectItem>>([])

const filtered = computed(() => {
  return options.value.filter(
    (option) =>
      option.user.name!.includes(props.keyword) &&
      !props.except.find((value) => value === option.user.id)
  )
})

onMounted(async () => {
  if (props.type === 'member' && props.gid) {
    options.value = await chat._getAllMembers(props.gid)
  } else {
    options.value = chat.friends.value
  }
  loaded.value = true
})

function handleSelect(item: SelectItem) {
  emit('select', item)
}
</script>
