<template>
  <div>
    <md-block class="code-block">
      <md-inline>{{ markers[0] }}</md-inline>
      <md-inline v-if="token.text" ref="code" class="code" v-html="highlighted"></md-inline>
      <md-inline v-if="markers[1]">{{ markers[1] }}</md-inline>
      <break v-if="token.raw.endsWith('\n') && atLast && markers[1] !== '\n```'"></break>
    </md-block>
    <break
      v-if="token.raw.endsWith('\n') && atLast && markers[1] === '\n```'"
      class="bg-transparent"
    ></break>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Tokens } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.min.css'
import Break from './break.vue'

const code = ref<HTMLElement>()

const props = defineProps<{
  atLast: boolean
  token: Tokens.Code
}>()

const markers = computed(() => getMarkers(props.token.raw))
const hasNext = computed(() => (props.token.raw.endsWith('\n') ? '\n' : ''))

const highlighted = computed(() => {
  const lang = props.token.lang!
  const code = props.token.text
  try {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    } else {
      return hljs.highlightAuto(code).value
    }
  } catch (e) {
    return hljs.highlight(code, { language: 'plaintext' }).value
  }
})

function getMarkers(raw: string): [string, string] {
  const startPattern = /^```(?:[^\n]*)\n?/

  const endPattern = /\n`{0,3}(?=\n?$)/

  const startMatch = raw.match(startPattern)
  const startMarker = startMatch ? startMatch[0] : ''

  const remaining = raw.slice(startMarker.length)

  if (!props.token.text) {
    const endMarker = remaining.endsWith('\n') ? remaining.slice(0, -1) : remaining
    return [startMarker, endMarker]
  }

  // Code text exists; find code within raw string
  const codeIndex = remaining.indexOf(props.token.text) + startMarker.length
  if (codeIndex === -1) {
    throw new Error('Code not found in raw input')
  }

  // Match end marker after code text
  const afterCode = raw.slice(codeIndex + props.token.text.length)
  const endMatch = afterCode.match(endPattern)
  const endMarker = endMatch ? endMatch[0] : ''

  return [startMarker, endMarker]
}
</script>

<style lang="scss" scoped>
.code-block {
  width: 100%;

  &,
  * {
    background-color: var(--bg3) !important;
  }

  span {
    color: var(--fg2);
  }
  .code {
    text-align: left;

    color: var(--k-font-color);
  }
}
</style>
