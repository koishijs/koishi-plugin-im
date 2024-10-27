<template>
  <div class="at markdown-inline" ref="at">@{{ target?.name || props.token.name }}</div>
  <el-popover :virtual-ref="at" virtual-triggering :visible="!isComplete" placement="top-start">
    <tiny-selector
      type="member"
      :except="[chat.getLogin().user!.id]"
      :gid="scene!.guild.id"
      :keyword="token.name"
      @select="handleSelect"
    ></tiny-selector>
  </el-popover>
</template>

<script lang="ts" setup>
import { inject, ref, onMounted, UnwrapRef, watchEffect } from 'vue'
import { Tokens } from 'marked'
import { useContext, root } from '@cordisjs/client'
import type { Im } from '@satorijs/plugin-im'
import type { Editor } from '../editor'
import Scene from '../../scene'

const ctx = useContext()
const chat = ctx['im.client']

const at = ref<HTMLElement>()

const editor = inject<Editor>('editor')
const scene = inject<UnwrapRef<Scene['chat-friend'] & Scene['chat-guild']>>('scene')

const props = defineProps<{
  token: Tokens.At
}>()

const isComplete = ref(false)

const target = ref<Im.Member>()

watchEffect(() => console.log(target))

onMounted(() => {
  console.log('mount')
})

function handleSelect(item: Im.Member) {
  target.value = item
  isComplete.value = true
}
</script>

<style lang="scss">
.at {
  background-color: var(--k-color-active);
}
</style>
