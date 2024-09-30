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
.code-span {
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: var(--fg2);
}
</style>
