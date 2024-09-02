<template>
  <div class="avatar relative" :class="sizeList">
    <img v-if="src" class="h-full w-full" :src="withProxy(src)" />
    <div
      v-else
      class="h-full w-full bg-[var(--bg3)] font-bold color-[var(--fg3)] flex justify-center items-center"
    >
      {{ name && short(name) }}
    </div>
    <div v-if="editable" class="edit h-full w-full flex items-center justify-center">
      <k-icon name="im:edit"></k-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue'
import { useRpc } from '@cordisjs/client'
import type { Login } from '@satorijs/protocol'
import getWidth from 'string-width'
import type { Data } from '../../../src'

const props = withDefaults(
  defineProps<{
    src?: string
    name?: string
    login: Login
    size: 'tiny' | 'small' | 'medium' | 'large' | 'extreme'
    editable: boolean
  }>(),
  {
    editable: false,
  }
)
const size = props.size || 'small'

const sizeList = {
  'w-5 h-5 font-size-2.5': size === 'tiny',
  'w-8 h-8 font-size-4': size === 'small',
  'w-40px h-40px font-size-20px': size === 'medium',
  'w-24 h-24 font-size-12': size === 'large',
  'w-48 h-48 font-size-24': size === 'extreme',
}

const data = useRpc<Data>()

function withProxy(url: string) {
  return data.value.serverUrl + '/im/v1/proxy/' + url
}

function short(name: string) {
  if (getWidth(name[0]) > 1) return name[0]
  return name.slice(0, 2)
}
</script>

<style lang="scss" scoped>
.avatar {
  border-radius: 100%;
  border: 1px solid var(--k-color-border);
  user-select: none;
  flex-shrink: 0;
  overflow: hidden;

  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.6;
  }
}

.edit {
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;

  background-color: var(--fg3);

  opacity: 0;

  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  svg {
    height: 45%;
    width: 45%;
  }
}
</style>
