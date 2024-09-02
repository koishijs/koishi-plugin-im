<template>
  <div
    class="im-more font-size-3.5 font-bold py-2 px-4 select-none flex flex-row items-center justify-between hover:op-80"
    @click="handle"
  >
    <div class="flex flex-row gap-2 items-center">
      <k-icon class="h-4 w-4" v-if="iconName" :name="iconName"></k-icon>
      <div>{{ fieldName }}</div>
    </div>
    <k-icon name="ellipsis"></k-icon>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['update'])

const props = defineProps<{
  iconName: string
  fieldName: string
}>()

function handle() {
  emit('update')
}
</script>

<style lang="scss" scoped>
.im-more {
  &,
  * {
    cursor: pointer;
  }
}
</style>
