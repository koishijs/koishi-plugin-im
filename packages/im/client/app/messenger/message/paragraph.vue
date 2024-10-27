<template>
  <div>
    <md-block>
      <component v-for="(child, index) in children" :key="index" :is="child" v-bind="child.props" />
    </md-block>
    <break v-if="token.raw.endsWith('\n') && atLast"></break>
  </div>
</template>

<script lang="ts" setup>
import { computed, VNode } from 'vue'
import { Tokens } from 'marked'
import Break from './break.vue'

const props = defineProps<{
  atLast: boolean
  token: Tokens.Paragraph
  children: VNode[]
}>()
</script>
