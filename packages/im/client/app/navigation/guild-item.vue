<template>
  <div
    class="guild-item flex flex-row items-center gap-3 h-7 p-3"
    :class="{ active: !isFolded }"
    @click="handleSwitch()"
  >
    <im-avatar size="small"></im-avatar>
    <label class="font-bold flex-1">{{ data.name }}</label>
    <k-icon name="chevron-right"></k-icon>
  </div>
  <div v-if="!isFolded">
    <div
      class="channel-item flex flex-row items-center gap-2 py-2 px-8 font-size-3 font-bold bg-[var(--bg2)]"
      v-for="value in data.channels"
      :key="value.id"
      @click="handleSelect(value)"
    >
      <k-icon name="im:text-channel"></k-icon>
      {{ value.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Im } from '@satorijs/plugin-im'
import { useContext, send } from '@cordisjs/client'
import Scene from '../scene'

const chat = useContext()['im.client']

const props = defineProps<{
  data: Im.Guild
}>()

const isFolded = ref<boolean>(true)

function handleSwitch() {
  isFolded.value = !isFolded.value
}

async function handleSelect(channel: Im.Channel) {
  const guild = props.data
  const id = await Scene.create('chat-guild', {
    uid: channel.id,
    title: guild.name!,
    subtitle: channel.name,
    guild,
    channel,
  })
  Scene.rend(id)
}
</script>

<style lang="scss" scoped>
.guild-item {
  &,
  * {
    cursor: pointer;
  }

  &:hover,
  &.active {
    background-color: var(--bg1);
  }
}
.channel-item {
  &:hover {
  }
}
</style>
