<template>
  <div class="flex flex-col">
    <div class="flex">
      <slot :data="stepper.data"></slot>
    </div>

    <div class="steps-controls">
      <el-button v-if="!stepper.hasPrev" @click="prevStep">返回</el-button>
      <el-button v-if="!stepper.hasNext" @click="nextStep">下一步</el-button>
      <el-button v-else @click="submit">提交</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { provide, reactive } from 'vue'
import { Stepper } from './step'

const stepper = reactive(new Stepper())

provide('stepper', stepper)

function prevStep() {
  stepper.prev()
}

function nextStep() {
  stepper.next()
}

function submit() {
  stepper.submit()
}
</script>
