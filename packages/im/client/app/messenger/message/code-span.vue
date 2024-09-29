<template>
  <md-inline class="code-span">
    {{ text }}
  </md-inline>
</template>

<script lang="ts" setup>
const props = defineProps<{
  text: string
}>()
</script>

<style lang="scss">
.code-block {
  color: var(--fg2);
}
</style>
