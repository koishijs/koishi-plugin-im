<template>
  <div class="im-settings flex flex-row items-center justify-between gap-1">
    <div>{{ fieldName }}</div>
    <el-switch v-model="field"></el-switch>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['edit'])
const field = defineModel<boolean>({ default: false })

const props = defineProps<{
  fieldName: string
}>()

function save() {
  // emit('edit', edited)
  // field.value = edited.value
}
</script>

<style lang="scss" scoped>
@use './index' as *;
</style>
