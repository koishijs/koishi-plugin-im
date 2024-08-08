<template>
  <div>
    <k-layout v-if="!isLogged">
      <k-im-login></k-im-login>
    </k-layout>
    <k-layout v-else :right="{ hidden: !isAsideOpen }">
      <template #header>{{ currentWindow.title }}</template>
      <template #menu>
        <div class="flex flex-row gap-2">
          <el-button class="p-0 h-8 w-8 shrink-0" @click.stop="triggerSetting($event)">
            <k-icon name="im:setting"></k-icon>
          </el-button>
        </div>
      </template>
      <template #left> <k-im-chat-list></k-im-chat-list> </template>
      <im-window></im-window>
      <template #right>
        <k-im-aside @ready="isAsideOpen = true" @dispose="isAsideOpen = false" />
      </template>
    </k-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watchEffect } from 'vue'
import { send, useContext, useMenu, useRpc } from '@cordisjs/client'
import { ImTypes } from '@satorijs/plugin-im'
import { currentWindow, ImWindow } from './windowed'
import shared from '../shared'
import { Data } from '../../src'

const localToken = shared.value.token
const ctx = useContext()
const chat = ctx['im.client']

const rpcData = useRpc<Data>()

watchEffect(() => {
  chat._eventHandler(rpcData.value.eventChan)
})

onMounted(() => {
  send('im/v1/login-add', { login: { token: localToken } as ImTypes.Login })
    .then((data) => {
      chat.setLogin(data)
      // watch(() => useRpc<Data>().value.eventChan, chat._eventHandler)
    })
    .catch((error) => {
      shared.value.token = ''
      chat.isLogged.value = false
    })
})

const triggerSetting = useMenu('user-settings')

const isLogged = computed(() => {
  return chat.isLogged.value
})

const isAsideOpen = ref<boolean>(false)
</script>
