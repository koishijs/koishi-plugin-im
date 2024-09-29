<template>
  <div>
    <div v-if="index === 0">
      <md-block>
        <text>{{ text.slice(0, -1) }}</text>
      </md-block>
      <break v-if="atLast"></break>
    </div>
    <div v-else-if="atLast">
      <md-block v-if="text.length > 1">
        <text>{{ text.slice(0, -1) }}</text>
      </md-block>
      <break></break>
    </div>
    <md-block v-else-if="text.length > 1">
      <text>{{ text.slice(0, -2) }}</text>
    </md-block>
  </div>
</template>

<script lang="ts" setup>
import Break from './break.vue'

const props = defineProps<{
  index: number
  atLast: boolean
  text: string
}>()
</script>
