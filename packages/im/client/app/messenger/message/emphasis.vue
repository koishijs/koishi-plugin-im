<template>
  <md-inline class="font-italic">
    <span>*</span>
    <component v-for="child in children" :is="child"></component>
    <span>*</span>
  </md-inline>
</template>

<script lang="ts" setup>
import { VNode } from 'vue'
import { Tokens } from 'marked'

const props = defineProps<{
  token: Tokens.Em
  children: VNode[]
}>()
</script>
