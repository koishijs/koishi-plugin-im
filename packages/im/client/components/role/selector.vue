<template>
  <div v-loading="!loaded" class="b-rd-2 flex flex-col">
    <div class="flex-1 flex flex-col">
      <div class="bg-[var(--bg2)] p-2 b-rd-tr-2 b-rd-tl-2">
        <el-input class="bg-[var(--bg2)]" v-if="filterable" v-model="keyword"></el-input>
      </div>
      <div class="grow-1">
        <el-scrollbar>
          <div
            v-for="value in leftItems"
            class="item h-10 p-2 flex flex-row gap-2 items-center justify-between"
            :class="{ active: value.active }"
            @click="handleSelect(value)"
          >
            <div class="flex flex-row gap-2 items-center">
              <im-avatar size="small" :user="value.user"></im-avatar>
              <span>{{ value.user.name }}</span>
            </div>
            <k-icon
              v-if="value.active"
              class="h-4 w-4 color-[var(--k-color-success)]"
              name="im:check"
            ></k-icon>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div
      v-if="showResult"
      class="b-t-1px b-t-solid b-t-[var(--k-color-divider)] h-10 p-2 b-rd-br-2 b-rd-bl-2 flex flex-row items-center gap-2"
    >
      <transition-group
        name="avatar-fade-in"
        tag="div"
        class="flex-1 flex flex-row gap-2 items-center"
      >
        <im-avatar
          v-for="item in rightItems"
          :key="item.user.id"
          size="small"
          :user="item.user"
          @click="handleSelectCancel"
        ></im-avatar>
      </transition-group>
      <div class="font-size-3 color-[var(--fg2)]">
        {{ rightItems.length }} of {{ leftItems.length }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, computed, ref, onMounted, watch } from 'vue'
import { useContext } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'

type SelectItem = (Im.Member | Im.Friend.Payload) & { active: boolean }

const chat = useContext()['im.client']

const selected = defineModel<string[]>()

// HACK: Cannot use local variables in defineProps() due to hoisting.
// Manually setting 'except' default value.
const props = defineProps<{
  type: 'friend' | 'member'
  except?: string[]
  gid?: string
  filterable?: boolean
  showResult?: boolean
}>()

const except = props.except || [chat.getLogin().user!.id]

onMounted(() => {
  getItems().then(() => (loaded.value = true))
})

onBeforeUnmount(() => {
  items.value = []
})

const loaded = ref(false)

const keyword = ref<string>('')
const items = ref<Array<SelectItem>>([])
const leftItems = computed(() =>
  items.value.filter(
    (item) =>
      item.user.name!.includes(keyword.value) && !except.find((value) => value === item.user.id)
  )
)
const rightItems = computed(() => {
  const items = leftItems.value.filter((item) => item.active)
  selected.value = items.map((item) => item.user.id)
  return items
})

async function getItems() {
  if (props.type === 'member' && props.gid) {
    items.value = initSelectable(await chat._getAllMembers(props.gid))
  } else {
    items.value = initSelectable(chat.friends.value)
  }
}

function handleSelect(value: SelectItem) {
  value.active = !value.active
}

function handleSelectCancel(value: SelectItem) {
  const result = leftItems.value.find((item) => item === value)
  if (result) result.active = false
}

function initSelectable(items: any[]): SelectItem[] {
  return items.map((item) => ({
    ...item,
    active: false,
  }))
}
</script>

<style lang="scss" scoped>
.item {
  transition: all 0.3s ease-in-out;

  border: 2px solid transparent;
}

.avatar-fade-in {
  &-enter-active {
    transition: opacity 0.3s ease;
  }

  &-leave-active {
    transition: none;
  }

  &-enter-from {
    opacity: 0;
  }
}
</style>
