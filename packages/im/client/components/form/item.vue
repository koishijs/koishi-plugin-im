<template>
  <div class="flex flex-col gap-2 p-4">
    <label v-if="label" class="font-size-4.5 font-bold">{{ label }}</label>
    <label v-if="description" class="pb-2 color-[var(--fg2)] font-size-3.25" type="info">{{
      description
    }}</label>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, withDefaults } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    description: string
    required: boolean
  }>(),
  {
    required: false,
  }
)
</script>
