<template>
  <k-content>
    <div>
      <el-input v-model="keyword" class="h-8" placeholder="输入 id，关键词等..."></el-input>
      <im-tab v-model="current" :data="tabItems"></im-tab>
    </div>
    <im-search v-model="selected" :keyword="keyword" :type="tabItems[current].type" class="py-4">
      <template #default="slotProps">
        <div class="px-4 py-2 flex flex-row justify-between items-center">
          <div class="flex flex-row gap-2 items-center">
            <im-avatar size="medium" :user="slotProps.item"></im-avatar>
            <template v-if="slotProps.type === 'guild'">
              <div>{{ slotProps.item.name }}</div>
            </template>
            <template v-if="slotProps.type === 'user'">
              <div class="font-bold">{{ getDisplayName(slotProps.item) }}</div>
              <div class="font-size-3.5">@{{ slotProps.item.name }}</div>
            </template>
          </div>
          <k-button
            v-if="slotProps.item === selected"
            class="self-end w-30"
            @click="invite(slotProps.item)"
            >添加</k-button
          >
        </div>
      </template>
    </im-search>
  </k-content>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { send, useContext, message } from '@cordisjs/client'
import { getDisplayName } from '.'

const chat = useContext()['im.client']

const selected = ref()
const keyword = ref<string>('')

const current = ref(0)
const tabItems = [
  {
    label: '用户',
    type: 'user',
  },
  {
    label: '群聊',
    type: 'guild',
  },
]

function invite(item: any) {
  if (tabItems[current.value].type === 'guild') {
    throw new Error('no implementation')
  } else {
    send('im/v1/invitation/friend', { login: chat.getLogin(), target: item.id, content: '' })
      .then(() => message.success('邀请发送成功'))
      .catch((err) => message.error(err))
  }
}
</script>
