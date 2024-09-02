<template>
  <div class="im-settings flex flex-col items-start justify-between gap-1">
    <div>{{ fieldName }}</div>
    <el-input v-model="field"></el-input>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['edit'])
const field = defineModel<string>({ default: '' })

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
