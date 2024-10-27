<template>
  <div class="flex flex-col">
    <h1 v-if="title">{{ title }}</h1>
    <template v-for="(child, index) in $slots.default()">
      <im-divider v-if="index === 0" />
      <component :is="child" />
      <im-divider />
    </template>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title: string
}>()
</script>
