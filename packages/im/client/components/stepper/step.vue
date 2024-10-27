<template>
  <div v-if="isActive">
    <slot :data="stepData"></slot>
  </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, computed, withDefaults } from 'vue'
import { Stepper, StepCallback } from './step'

const props = withDefaults(
  defineProps<{
    callback: StepCallback
  }>(),
  {
    callback: () => {},
  }
)

const stepper = inject<Stepper>('stepper')!

const isActive = computed(() => stepper.index === stepIndex)

const stepIndex = stepper.steps.length

onMounted(() => {
  stepper.addStep(props.callback)
})

const stepData = computed(() => stepper.data)
</script>
