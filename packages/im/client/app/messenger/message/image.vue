<template>
  <el-image class="image" :src="withProxy(src)" lazy>
    <template #error>
      <div class="failed flex items-center justify-center p-2">
        <span class="font-size-3.25">加载失败</span>
      </div>
    </template>
  </el-image>
</template>

<script lang="ts" setup>
import { root, useRpc } from '@cordisjs/client'
import type { Data } from '../../../../src'

// HACK: Unreliable API.
const ElPopover = root.app._context.components['ElPopover']
const data = useRpc<Data>()

const props = withDefaults(
  defineProps<{
    src: string
    name: string
  }>(),
  {
    name: '图片',
  }
)

function withProxy(url: string) {
  return data.value.serverUrl + '/im/v1/proxy/' + url
}
</script>

<style lang="scss" scoped>
.trigger {
  color: var(--k-color-active);
  cursor: pointer;

  &.active,
  &:hover {
    text-decoration: underline;
  }
}

.image {
  max-height: 20rem;

  max-width: 20rem;

  border-radius: 0.5rem;
  border: 2px solid transparent;

  transition: border 0.1s ease;

  &:hover {
    border: 2px solid var(--k-color-active);
  }

  .failed {
    height: 4rem;
    width: 4rem;
    background-color: var(--fg2);
    color: var(--fg1);
  }
}
</style>
