<template>
  <im-aside ref="containerRef" @ready="emit('ready')" @fold="emit('fold')">
    <div class="flex flex-col">
      <div class="flex flex-col gap-1 p-4">
        <div class="flex flex-row items-end relative">
          <file-picker @add="uploadAvatar" accept="image/*"
            ><im-avatar size="large" :name="guild.name" :src="guild.avatar" editable></im-avatar
          ></file-picker>
        </div>
        <div class="flex flex-col gap-1 px-2">
          <label class="font-size-5 font-bold">{{ guild.name }}</label>
          <label>创建于 {{ formatTimestamp(guild.createdAt!, 'ymdh') }}</label>
        </div>
      </div>
      <im-divider spacing="0"></im-divider>
      <div class="h-30 px-3 py-1 flex flex-col">
        <label class="font-size-5 overflow-hidden text-ellipsis">announcement.name</label>
        <div class="overflow-hidden text-ellipsis">text</div>
      </div>
      <im-divider spacing="0"></im-divider>
      <settings-collapse
        icon-name="im:personnel"
        :field-name="`成员 (${ guild.members!.length })`"
        @click="containerRef!.rendWindow('showMembers', getMembers)"
      ></settings-collapse>
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
        icon-name="im:add-square"
        field-name="邀请成员"
        @click="showInvite = true"
      ></settings-collapse>
      <im-divider spacing="0"></im-divider>
      <settings-collapse
        icon-name="im:settings-slider"
        field-name="常规设定"
        @click="containerRef!.rendWindow('regularSettings')"
      ></settings-collapse>
      <settings-collapse
        v-if="authorized"
        icon-name="im:settings-slider"
        field-name="群管理"
        @click="containerRef!.rendWindow('authorizedSettings')"
      ></settings-collapse>
    </div>

    <template #showMembers>
      <el-scrollbar>
        <div v-for="member in members" class="p-2 flex flex-row justify-between">
          <div class="flex flex-row gap-2 items-center">
            <im-avatar size="tiny"></im-avatar>
            <div>{{ /* TODO: */ getDisplayName(member.user, undefined, member) }}</div>
            <im-tag
              v-if="member.roles"
              :color="`#${member.roles[0].color}`"
              :title="member.roles[0].name"
              >{{ member.roles[0] }}</im-tag
            >
          </div>
          <div class="flex flex-row gap-2">
            <k-icon name="add"></k-icon>
            <k-icon name="im:ellipsis-vertical"></k-icon>
          </div>
        </div>
      </el-scrollbar>
    </template>

    <template #announcements></template>

    <template #showMessages></template>

    <!-- inviteMember -->
    <el-dialog class="w-60" v-model="showInvite" title="成员邀请" destroy-on-close>
      <user-selector
        v-model="toInvite"
        class="h-80 b-1px b-solid b-[var(--k-color-divider)]"
        type="friend"
        :except="guild.members"
        filterable
        show-result
      ></user-selector>
      <template #footer>
        <el-button @click="showInvite = false">取消</el-button>
        <el-button @click="sendInvite">确定</el-button>
      </template>
    </el-dialog>

    <template #regularSettings>
      <settings-form>
        <settings-switch v-model="settings.pinned" field-name="置顶"></settings-switch>
        <!-- aboutMe settings -->
        <settings-input v-model="settings.myNick" field-name="我的群内昵称"></settings-input>
        <settings-input v-model="settings.guildNick" field-name="群备注"></settings-input>
        <settings-select
          v-model="settings.notifyLevel"
          field-name="通知等级"
          :options="notifyLevelOptions"
        ></settings-select>
      </settings-form>
      <settings-form>
        <template #title><label>其他操作</label></template>
        <essential label="退出本群"></essential>
      </settings-form>
    </template>

    <template #authorizedSettings>
      <settings-form>
        <template #title><label>管理设定</label></template>
        <settings-input v-model="settings.guildName" field-name="群名称"></settings-input>
        <settings-input v-model="settings.channelName" field-name="频道名称"></settings-input>
        <!-- <settings-select
            v-model="settings.notifyLevel"
            field-name="加群设定"
            :options="notifyLevelOptions"
          ></settings-select> -->
      </settings-form>
    </template>
  </im-aside>
</template>

<script setup lang="ts">
import { reactive, ref, computed, UnwrapRef } from 'vue'
import { message, send, useContext } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'
import Scene from '../scene'
import { getDisplayName } from '../user'
import { formatTimestamp } from '../../utils'
import type Aside from './aside.vue'

const chat = useContext()['im.client']

const containerRef = ref<typeof Aside>()

const emit = defineEmits(['fold', 'ready'])

const props = defineProps<{
  data: UnwrapRef<Scene['chat-guild']>
}>()

const guild = computed(() => props.data.guild)
const members = ref<Array<Im.Member>>()
const authorized = ref(true)

const toInvite = ref<string[]>([])
const showInvite = ref<boolean>(false)

const settings = reactive({
  avatar: guild.value.avatar,
  guildName: guild.value.name,
  myNick: '', // 'props.data.member.ni,'
  guildNick: '', // 'props.data.member.setting.nick
  pinned: false,
  channelName: props.data.channel.name,
  notifyLevel: 1,
})

const notifyLevelOptions = [
  {
    label: '屏蔽推送',
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
]

async function uploadAvatar(files: string) {
  const avatar = files[0]

  await send('im/v1/avatar-upload', { login: chat.getLogin(), b64: avatar, gid: guild.value.id })
  message.success('上传成功!')
}

// HACK: every-time-load temporarily.
async function getMembers() {
  members.value = await send('im/v1/guild-member/fetch-all', {
    login: chat.getLogin(),
    gid: guild.value.id,
  })
}

function sendInvite() {
  for (let i = 0; i < toInvite.value.length; i++) {
    send('im/v1/invitation/member', {
      login: chat.getLogin(),
      target: toInvite.value[i],
      content: '',
      gid: guild.value.id,
    })
  }
  toInvite.value = []
  showInvite.value = false
}
</script>
