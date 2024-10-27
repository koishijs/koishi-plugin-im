<template>
  <div>
    <md-block>
      <div v-for="item in token.items">
        <md-inline class="color-[var(--k-color-active)] font-bold">
          {{ itemSlice(item)[0] }}
        </md-inline>
        <md-inline>
          {{ item.text }}
        </md-inline>
      </div>
    </md-block>
    <break v-if="token.raw.endsWith('\n') && atLast"></break>
  </div>
</template>

<script lang="ts" setup>
import { Tokens } from 'marked'
import Break from './break.vue'

const props = defineProps<{
  atLast: boolean
  token: Tokens.List
}>()

function itemSlice(item: Tokens.ListItem): [string, string] {
  const list = props.token
  let prefix: string, content: string

  if (list.ordered) {
    const match = item.raw.match(/^(\d+\.\s*)(.*)/)
    if (match) {
      prefix = match[1] || ''
      content = match[2] || item.text
    } else {
      prefix = ''
      content = item.text
    }
  } else {
    const match = item.raw.match(/^([-*+]\s*)(.*)/)
    if (match) {
      prefix = match[1] || ''
      content = match[2] || item.text
    } else {
      prefix = ''
      content = item.text
    }
  }

  return [prefix, content]
}
</script>
