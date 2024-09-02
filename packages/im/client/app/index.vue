<template>
  <div class="im-root">
    <k-layout v-if="chat.status.value === 'logging-in'">
      <im-login></im-login>
    </k-layout>
    <k-layout v-else-if="chat.status.value === 'syncing'">
      <k-empty></k-empty>
    </k-layout>
    <k-layout v-else-if="chat.status.value === 'verifying'">
      <k-empty></k-empty>
    </k-layout>
    <k-layout v-else :right="{ hidden: !isAsideOpen }">
      <template #header>
        <div class="flex flex-row gap-0.5">
          <label>{{ Scene.current.value.title }}</label>
          <label class="color-[var(--fg2)]">{{ Scene.current.value.subtitle }}</label>
        </div>
      </template>
      <template #menu>
        <div class="flex flex-row gap-2">
          <el-button class="p-0 h-8 w-8 shrink-0" @click.stop="triggerSetting($event)">
            <k-icon name="im:settings"></k-icon>
          </el-button>
        </div>
      </template>
      <template #left> <im-navigation></im-navigation> </template>
      <div class="im-main h-full flex">
        <component
          class="flex-1"
          :is="Scene.current.value.component"
          :scene="Scene.current.value"
        ></component>
        <div
          class="folder px-1 py-4 h-4 bg-[var(--bg2)]"
          v-if="isAsideDisabled === false"
          @click="isAsideOpen = !isAsideOpen"
        >
          <k-icon v-if="isAsideOpen" name="chevron-right"></k-icon>
          <k-icon v-else name="chevron-left"></k-icon>
        </div>
      </div>
      <template #right>
        <component
          class="h-full"
          :is="aside"
          :data="Scene.current.value"
          @ready="asideSwitch(true, false)"
          @fold="asideSwitch(false, false)"
          @dispose="asideSwitch(false, true)"
        ></component>
      </template>
    </k-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useContext, useMenu, useRpc } from '@cordisjs/client'
import Scene from './scene'
import { Data } from '../../src'
import { ImNavigation } from './navigation'

const ctx = useContext()
const chat = ctx['im.client']

const rpcData = useRpc<Data>()

watch(
  () => rpcData.value.eventChan,
  () => {
    if (chat.status.value === 'logged') {
      chat._eventHandler(rpcData.value.eventChan)
    }
  }
)

const triggerSetting = useMenu('user-settings')

const aside = computed(() => {
  if (!Scene.current.value.aside) {
    asideSwitch(false, true)
    return undefined
  }
  asideSwitch(true, false)
  return Scene.current.value.aside
})
const isAsideOpen = ref<boolean>(true) // TODO:
const isAsideDisabled = ref<boolean>(true)

function asideSwitch(open: boolean, disabled: boolean) {
  isAsideOpen.value = open
  isAsideDisabled.value = disabled
}
</script>

<style lang="scss">
.im-root {
  font-size: 14px;
}

.im-main {
  position: relative;

  .folder {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);

    border: 1px solid var(--k-color-divider);
    border-right: none;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
}
</style>
