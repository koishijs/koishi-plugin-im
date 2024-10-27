<template>
  <div class="h-4 p-1 flex flex-row items-center gap-3" @click="handleSwitch()"></div>
  <div v-if="!isFolded" v-for="item in grouped">
    <slot v-bind="item"></slot>
  </div>
</template>

<script lang="ts" setup generic="T">
import { computed, ref } from 'vue'
import Grouper, { Resolver } from '.'

const props = defineProps<{
  data: T[]
  resolvers: Resolver<T>[]
}>()

const isFolded = ref<boolean>(true)

const grouped = computed(() => {
  const grouper = new Grouper(props.data, props.resolvers)

  return grouper.resolve()
})

function handleSwitch() {
  isFolded.value = !isFolded.value
}
</script>
