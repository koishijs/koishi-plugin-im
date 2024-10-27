<template>
  <div
    class="im-settings im-collapse select-none flex flex-row items-center justify-between px-4"
    @click="handle"
  >
    <div class="flex flex-row gap-2 items-center">
      <k-icon class="h-4 w-4" v-if="iconName" :name="iconName"></k-icon>
      <div>{{ fieldName }}</div>
    </div>

    <k-icon name="chevron-right"></k-icon>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['trigger'])

const props = defineProps<{
  iconName: string
  fieldName: string
}>()

function handle() {
  emit('trigger')
}
</script>

<style lang="scss">
@use './index' as *;

.im-collapse {
  transition: all 0.1s ease;

  &,
  * {
    cursor: pointer;
  }

  &:hover {
    background-color: var(--bg1);
  }
}
</style>
