<template>
  <div class="flex flex-col">
    <div class="flex flex-row items-center gap-5 h-16 p-3">
      <k-im-avatar size="large"></k-im-avatar>
      <div class="flex flex-col">
        <span class="font-size-6">nick</span>
        <span class="font-size-4">@name</span>
      </div>
    </div>
    <k-im-tab :data="tabItems" @item-click="setList"></k-im-tab>
    <div>
      <virtual-list
        :data="current"
        activate="top"
        max-height="calc(100vh - 9.75rem)"
        key-name="id"
        @item-click="handleSelection"
      >
        <template #default="slotProps">
          <guild-item :data="slotProps" />
        </template>
        <template #footer> </template>
      </virtual-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ImTypes } from '@satorijs/plugin-im'
import GuildItem from './guild-item.vue'

const current = ref<Array<any>>([
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
  {
    id: 1,
    name: 1,
  },
])

const tabItems = [
  { label: '好友', isIcon: false },
  { label: '群聊', isIcon: false },
  { label: '消息', isIcon: false },
]

const myInfo = ref<ImTypes.User>()

const friendItems = ref<Array<ImTypes.Friend>>([])
const channelItems = ref<Array<ImTypes.Channel>>([])
const sessionItems = ref<Array<ImTypes.Message>>([])

function handleSelection() {}

function setList(index: number) {
  const valueList = [friendItems, channelItems, sessionItems]
  current.value = valueList[index].value
}
</script>
