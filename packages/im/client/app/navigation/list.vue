<template>
  <div class="flex-1 flex flex-col">
    <div class="p-4 flex flex-col gap-2 bg-[var(--bg1)]">
      <im-avatar size="medium" :user="me"></im-avatar>
      <div class="px-1 flex flex-col gap-1">
        <label class="font-size-5 font-bold">欢迎, {{ getDisplayName(me) }}</label>
        <label>@{{ me.name }}</label>
      </div>
    </div>
    <div class="search flex flex-row items-center">
      <el-input v-model="keyword" placeholder="搜索..." #prefix>
        <k-icon name="search"></k-icon>
      </el-input>
      <div class="add p-2 flex" @click.stop="triggerAdd"><k-icon name="add"></k-icon></div>
    </div>
    <im-tab
      class="b-b-1px b-b-solid b-b-[var(--k-color-divider)]"
      v-model="current"
      :data="tabItems"
    ></im-tab>
    <div class="flex-1">
      <virtual-list
        v-if="tabItems[current].data.value"
        :data="tabItems[current].data.value"
        max-height="calc(100vh - 17rem)"
        class="select-none"
      >
        <template #header> </template>
        <template #default="slotProps">
          <component :is="tabItems[current].component" :data="slotProps"></component>
        </template>
        <template #footer>
          <div class="w-full py-2 text-center font-size-3 color-[var(--fg3)]">--列表底部--</div>
        </template>
      </virtual-list>
      <div v-else class="flex-1 flex flex-row items-center justify-center">
        <label class="font-bold">加载中...</label>
      </div>
    </div>
    <div class="b-t-1px b-t-solid b-t-[var(--k-color-divider)]">
      <more icon-name="im:inbox" field-name="通知" @click="showMsgBox"></more>
      <more icon-name="im:bookmark" field-name="收藏消息"></more>
      <more icon-name="im:settings-gear" field-name="用户设定" @click="editUser"></more>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { send, useContext, useMenu } from '@cordisjs/client'

import GuildItem from './guild-item.vue'
import FriendItem from './friend-item.vue'
import SessionItem from './session-item.vue'
import Scene from '../scene'
import { debounce } from '../../utils'
import { getDisplayName } from '../user'

const ctx = useContext()
const chat = ctx['im.client']

const tabItems = [
  {
    icon: 'im:chat',
    grow: 2,
    data: computed(() => {
      return Object.values(Scene.mounted.value)
    }),
    component: SessionItem,
  },
  {
    icon: 'user',
    grow: 2,
    data: ctx['im.client'].friends,
    component: FriendItem,
  },
  {
    icon: 'im:group',
    grow: 2,
    data: ctx['im.client'].guilds,
    component: GuildItem,
  },
]

const current = ref<number>(0)
const keyword = ref<string>()

watch(keyword, (value) => debounce(search, 500)(value!))

const triggerAdd = useMenu('new-chat')

ctx.action('new-chat.add', async () => {
  const id = await Scene.create('search', { title: '搜索', uid: '1' })
  Scene.rend(id)
})
ctx.action('new-chat.create-guild', async () => {
  const id = await Scene.create('create-guild', { title: '新群组' })
  Scene.rend(id)
})

const me = computed(() => chat.getLogin().user!)

function search(keyword: string) {}

async function editUser() {
  const id = await Scene.create('edit-user', {
    uid: '1',
    title: '用户设定',
    user: me.value,
  }) // TODO: ptr
  Scene.rend(id)
} // HACK

async function showMsgBox() {
  const id = await Scene.create(
    'msg-box',
    {
      uid: '1',
      title: '通知',
    },
    {
      onInit: async (scene) => {
        scene.msgs = await send('im/v1/notification/fetch-all', { login: chat.getLogin() })
        const userPromises = scene.msgs.map(async (msg) => {
          const self = await chat.getUser(msg.selfId)
          return {
            ...msg,
            self,
          }
        })

        scene.msgs = await Promise.all(userPromises)
      },
    }
  )
  Scene.rend(id)
}
</script>

<style lang="scss" scoped>
.search {
  border-bottom: 1px solid var(--k-color-divider);

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 0;
  }

  :deep(.el-textarea__inner) {
    box-shadow: none;
    border: none;
  }
}

.add:hover {
  svg {
    color: var(--k-color-active);
  }
}
</style>
