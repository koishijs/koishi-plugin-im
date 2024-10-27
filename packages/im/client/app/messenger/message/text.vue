<template>
  <md-inline>
    {{ text }}
  </md-inline>
</template>

<script lang="ts" setup>
const props = defineProps<{
  text: string
}>()
</script>
