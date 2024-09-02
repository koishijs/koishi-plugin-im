<template>
  <div
    class="window-item flex flex-row items-center gap-4 h-10 p-3"
    @click="Scene.rend(data.id!)"
    @contextmenu.stop="trigger($event, data)"
  >
    <im-avatar size="small"></im-avatar>
    <div class="flex-1 flex flex-col gap-1">
      <div class="ellipsis font-bold">
        <label>{{ data.title }}</label>
        <label v-if="data.subtitle" class="color-[var(--fg2)]">{{ `:${data.subtitle}` }}</label>
      </div>
      <label class="ellipsis font-size-3 color-[var(--fg2)] min-h-2">{{ data.brief }}</label>
    </div>
    <el-badge
      v-if="data.unread && Scene.current.value.id !== data.id"
      :value="data.unread"
    ></el-badge>
  </div>
</template>

<script setup lang="ts">
import { computed, UnwrapRef } from 'vue'
import { useContext, useMenu } from '@cordisjs/client'
import Scene from '../scene'

const ctx = useContext()
const chat = ctx['im.client']

const emit = defineEmits(['close', 'pin', 'unpin'])

const props = defineProps<{
  data: UnwrapRef<Scene.Prototype>
}>()

const trigger = useMenu('session')
</script>

<style lang="scss">
.window-item {
  border-bottom: 1px solid --var(--k-color-divider);

  &,
  * {
    cursor: pointer;
  }

  &:hover,
  &.active {
    background-color: var(--bg1);
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
