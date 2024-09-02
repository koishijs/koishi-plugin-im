<template>
  <div>
    <div class="flex" @click="showDialog = true">
      <slot>
        <el-button class="grow-1" type="danger" plain>{{ label }}</el-button>
      </slot>
    </div>
    <el-dialog v-model="showDialog" title="确定吗？" @close="showDialog = false" destroy-on-close>
      <label>{{ dialogContext }}</label>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, withDefaults } from 'vue'

const emit = defineEmits(['cancel', 'confirm'])

const props = withDefaults(
  defineProps<{
    label: string
    disabled?: boolean
    dialogContext?: string
  }>(),
  {
    disabled: false,
    dialogContext: '确定要执行本操作吗？',
  }
)

const showDialog = ref<boolean>(false)

function handleConfirm() {
  emit('confirm')
  showDialog.value = false
}
</script>
