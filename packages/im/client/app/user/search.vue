<template>
  <div class="flex flex-col items-center p-10">
    <div>
      <el-input v-model="keyword" class="w-150 h-8" placeholder="输入 id，关键词等..."></el-input>
      <im-tab v-model="current" :data="tabItems"></im-tab>
    </div>
    <div class="flex flex-row">
      <im-search
        class="w-100"
        v-model="selected"
        :keyword="keyword"
        :type="tabItems[current].type"
        select-mode="single"
      >
        <template #default="slotProps">
          <div class="px-4 py-2">
            <div v-if="slotProps.type === 'user'" class="flex flex-row gap-2 items-center">
              <im-avatar size="medium"></im-avatar>
              <div>{{ slotProps.item.nick }}</div>
              <div>@{{ slotProps.item.name }}</div>
            </div>
            <div v-if="slotProps.type === 'guild'" class="flex flex-row gap-2 items-center">
              <im-avatar size="medium"></im-avatar>
              <div>{{ slotProps.item.nick }}</div>
              <div>@{{ slotProps.item.name }}</div>
            </div>
          </div>
        </template>
      </im-search>
      <div v-if="selected">
        <im-avatar size="large"></im-avatar>
        {{ selected.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const selected = ref()
const keyword = ref<string>('')

const current = ref(0)
const tabItems = [
  {
    label: '群聊',
    type: 'guild',
  },
  {
    label: '用户',
    type: 'user',
  },
]
</script>
