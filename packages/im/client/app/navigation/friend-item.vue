<template>
  <div
    class="friend-item flex flex-row items-center gap-3 h-7 p-3 cursor-pointer"
    @click="handleSelect"
  >
    <im-avatar size="small" :user="data.user"></im-avatar>
    <label class="font-bold"> {{ data.user.name }} </label>
  </div>
</template>

<script setup lang="ts">
import type { Im } from '@satorijs/plugin-im'
import Scene from '../scene'
import { getDisplayName } from '../user'

const props = defineProps<{
  data: Im.Friend.Payload
}>()

async function handleSelect() {
  const friend = props.data
  const id = await Scene.create('chat-friend', {
    uid: friend.channel?.id,
    title: getDisplayName(friend.user, { name: friend.nick! }),
    channel: props.data.channel!,
    friend: props.data,
  })

  Scene.rend(id)
}
</script>

<style lang="scss" scoped>
.friend-item {
  &,
  * {
    cursor: pointer;
  }

  &:hover {
    background-color: var(--bg1);
  }
}
</style>
