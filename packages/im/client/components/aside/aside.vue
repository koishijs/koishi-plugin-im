<template>
  <div class="p-4">
    <component :is="current"></component>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, Component } from 'vue'
import UserAside from './aside-user.vue'
import GuildAside from './aside-guild.vue'
import ChannelAside from './aside-channel.vue'

const props = defineProps<{
  activate: boolean
}>()
const activate = props.activate || false

const UserComponent = UserAside
const EmptyComponent = null

const current = ref<Component>(UserAside)
</script>
