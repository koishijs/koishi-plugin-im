<template>
  <k-content>
    <im-form class="flex-1">
      <im-form-item label="群组名称" :required="true">
        <el-input class="w-30%" v-model="guildForm.name"></el-input>
      </im-form-item>

      <im-form-item label="初始频道名称" description="非必填">
        <el-input class="w-30%" v-model="guildForm.name"></el-input>
      </im-form-item>

      <im-form-item label="选择成员" description="成员仅可从好友邀请">
        <user-selector
          v-model="guildForm.toInvite"
          class="h-80 b-1px b-solid b-[var(--k-color-divider)]"
          type="friend"
          filterable
          show-result
        ></user-selector>
      </im-form-item>
    </im-form>

    <div class="flex justify-end p-4">
      <el-button type="primary" plain @click="createGuild">创建群组</el-button>
    </div>
  </k-content>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message, send, useContext } from '@cordisjs/client'
import Scene from '../scene'

const chat = useContext()['im.client']

const props = defineProps<{
  scene: Scene.Prototype
}>()

const guildForm = ref({
  name: '',
  channelName: '',
  toInvite: [],
})
const keyword = ref<string>('')

function createGuild() {
  send('im/v1/guild/create', {
    login: chat.getLogin(),
    name: guildForm.value.name,
    options: {
      inviteUsers: guildForm.value.toInvite,
      initialChannelName: guildForm.value.channelName,
    },
  })
    .then(() => {
      message.success('创建成功')
      Scene.close(props.scene.id!)
    })
    .catch(() => message.error('创建失败'))
}
</script>
