<template>
  <k-content>
    <div class="flex flex-col">
      <div class="flex flex-row gap-10">
        <k-form class="grow-1" v-model="form" :schema="rule" :initial="initial">
          <template #title> 基本信息 </template>
          <template #after>
            <div class="p-4 w-full flex flex-col">
              <k-button class="self-end w-30" @click="uploadSettings">确认</k-button>
            </div>
          </template>
        </k-form>
        <im-avatar size="extreme"></im-avatar>
      </div>
      <h1 class="k-schema-header">其他选项</h1>
      <essential class="w-30" label="登出" @confirm="logout"></essential>
    </div>
  </k-content>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Schema, send, useContext, message } from '@cordisjs/client'
import Scene from '../scene'

const chat = useContext()['im.client']

const props = defineProps<{
  scene: Scene['edit-user']
}>()

const initial = ref({
  nick: props.scene.user!.name,
})

const form = ref({})

const rule = Schema.object({
  nick: Schema.string()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .description('在平台内显示的昵称'),
})

function uploadSettings() {
  try {
    console.log(rule(form.value))
  } catch (e) {
    message.error('设定值不符合约束')
    return
  }
}

function logout() {
  send('im/v1/login-remove', { login: chat.getLogin() }).then(() => chat.logout())
}
</script>
