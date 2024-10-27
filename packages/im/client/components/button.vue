<template>
  <button @click.prevent="onClick" class="k-button" :class="(type, { disabled })">
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
import { withDefaults } from 'vue'

const emit = defineEmits(['click'])

const props = withDefaults(
  defineProps<{
    type: string
    solid: boolean
    frameless: boolean
    title: string
    round: boolean
    disabled: boolean
  }>(),
  { type: 'secondary' }
)

function onClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}
</script>

<style lang="scss"></style>
