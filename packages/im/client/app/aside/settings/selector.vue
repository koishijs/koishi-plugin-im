<template>
  <div class="im-settings flex flex-col items-start gap-1">
    <div>{{ fieldName }}</div>
    <el-select v-model="field">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
      </el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts" generic="T">
const emit = defineEmits(['edit'])
const field = defineModel<T>({})

const props = defineProps<{
  fieldName: string
  options: Array<{
    label: string
    value: T
  }>
}>()
</script>

<style lang="scss" scoped>
@use './index' as *;
</style>
