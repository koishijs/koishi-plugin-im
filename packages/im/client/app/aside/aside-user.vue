<template>
  <im-aside ref="containerRef" @ready="emit('ready')" @fold="emit('fold')">
    <div class="flex flex-col">
      <div class="flex flex-col gap-1 p-4">
        <im-avatar size="large" :name="friend.user.name"></im-avatar>
        <div class="px-1 flex flex-row gap-1 items-center">
          <label>{{ getDisplayName(friend.user, { name: friend.nick! }) }}</label>
          <label class="color-[var(--fg2)]">@{{ friend.user.name }}</label>
        </div>
      </div>
      <im-divider spacing="0"></im-divider>
      <div class="h-30 px-3 py-1 flex flex-col">
        <label class="font-size-5 overflow-hidden text-ellipsis">announcement.name</label>
        <div class="overflow-hidden text-ellipsis">text</div>
      </div>
      <im-divider spacing="0"></im-divider>
      <settings-collapse
        icon-name="im:message"
        field-name="聊天记录..."
        @click="containerRef!.rendWindow('showMessages')"
      ></settings-collapse>
      <settings-collapse
        icon-name="im:image"
        field-name="图片..."
        @click="containerRef!.rendWindow('authorizedSettings')"
      ></settings-collapse>
      <settings-collapse
        icon-name="im:folder"
        field-name="文件..."
        @click="containerRef!.rendWindow('authorizedSettings')"
      ></settings-collapse>
      <im-divider spacing="0"></im-divider>
      <settings-collapse
        icon-name="im:settings-slider"
        field-name="设定"
        @click="containerRef!.rendWindow('settings')"
      ></settings-collapse>
    </div>

    <template #settings>
      <settings-form>
        <settings-switch v-model="settings.pinned" field-name="置顶"></settings-switch>
        <!-- aboutMe settings -->
        <settings-input v-model="settings.nick" field-name="好友备注"></settings-input>
        <settings-input v-model="settings.nick" field-name="分组名称"></settings-input>
        <settings-select
          v-model="settings.notifyLevel"
          field-name="通知等级"
          :options="notifyLevelOptions"
        ></settings-select>
      </settings-form>
      <settings-form>
        <template #title><label>其他操作</label></template>
        <essential label="解除关系"></essential>
      </settings-form>
    </template>
  </im-aside>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, UnwrapRef } from 'vue'
import { useContext } from '@cordisjs/client'
import Scene from '../scene'
import { getDisplayName } from '../user'
import type Aside from './aside.vue'

const chat = useContext()['im.client']

const containerRef = ref<typeof Aside>()

const emit = defineEmits(['fold', 'ready'])

const props = defineProps<{
  data: UnwrapRef<Scene['chat-friend']>
}>()

const friend = computed(() => props.data.friend)

const settings = reactive({
  nick: friend.value.nick,
  notifyLevel: friend.value.level || 2,
  pinned: friend.value.pinned,
  group: friend.value.group,
})

const notifyLevelOptions = [
  {
    label: '屏蔽',
    value: 0,
  },
  {
    label: '静默通知',
    value: 1,
  },
  {
    label: '正常推送',
    value: 2,
  },
  {
    label: '特别提醒',
    value: 3,
  },
] // TODO
</script>
