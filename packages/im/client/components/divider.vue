<template>
  <div
    :class="['divider', `${direction}`, contentPosition ? `content-${contentPosition}` : '']"
    :style="{
      borderWidth: size,
      margin: direction === 'vertical' ? `0 ${spacing}` : `${spacing} 0`,
    }"
  >
    <div v-if="contentPosition" class="divider-content">
      <slot />
    </div>
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { withDefaults, defineProps } from 'vue'

const props = withDefaults(
  defineProps<{
    direction?: 'horizontal' | 'vertical'
    spacing?: string
    contentPosition?: 'left' | 'right' | 'center'
    size: string
  }>(),
  {
    direction: 'horizontal',
    spacing: '0.5rem',
    size: '2px',
  }
)
</script>

<style lang="scss" scoped>
.divider {
  &.horizontal {
    border-top: 1px solid var(--k-color-divider);
    width: 100%;
  }

  &.vertical {
    border-left: 1px solid var(--k-color-divider);
    display: inline-block;
  }

  &.bar {
  }

  .content-left {
    float: left;
    padding-right: 1rem;
  }

  .content-right {
    float: right;
    padding-left: 1rem;
  }

  .content-center {
    text-align: center;
    width: 100%;
    padding: 0.5rem 0;
  }

  .divider-content {
    padding: 0.5rem;
  }
}
</style>
