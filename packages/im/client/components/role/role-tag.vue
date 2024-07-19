<template>
  <el-tag v-bind="props" class="border-none color-[var(--k-text-normal)]">Koishi</el-tag>
</template>

<script setup lang="ts">
import type { TagProps } from 'element-plus'

const props = defineProps<TagProps>()
</script>
