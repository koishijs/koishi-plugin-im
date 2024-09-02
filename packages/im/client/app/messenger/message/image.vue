<template>
  <div class="relative">
    <el-popover placement="top" :title="name" trigger="click">
      <template #reference>
        <label class="trigger"> $[{{ name }}] </label>
      </template>
      <template #default>
        <div class="image p-1">
          <img :src="src" />
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script lang="ts" setup>
import { root } from '@cordisjs/client'

// HACK: Unreliable API.
const ElPopover = root.app._context.components['ElPopover']

const props = withDefaults(
  defineProps<{
    src: string
    name: string
  }>(),
  {
    name: '图片',
  }
)
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
  position: absolute;
  bottom: 100%;
  left: 100%;
}
</style>
