<template>
  <div>
    <md-block>
      <md-inline class="heading">{{ headingPrefix(token.raw) }}</md-inline>
      <component
        v-for="(child, index) in children"
        :key="index"
        :is="child"
        v-bind="child.props"
      ></component>
    </md-block>
    <break v-if="token.raw.endsWith('\n') && atLast"></break>
  </div>
</template>

<script lang="ts" setup>
import { VNode } from 'vue'
import { Tokens } from 'marked'
import Break from './break.vue'

const props = defineProps<{
  atLast: boolean
  token: Tokens.Heading
  children: VNode[]
}>()

function headingPrefix(raw: string) {
  const suffixIndex = raw.lastIndexOf(props.token.text)
  if (suffixIndex !== -1) {
    return raw.slice(0, suffixIndex)
  } else {
    return raw
  }
}
</script>

<style lang="scss">
.heading {
  font-style: bold;
  color: var(--k-color-active);
}
</style>
