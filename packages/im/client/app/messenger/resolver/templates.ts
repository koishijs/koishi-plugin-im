import { h } from 'vue'
import { h as Element } from '@satorijs/core'
import { Tokens } from 'marked'
import { RendererPlugin } from './resolver'
import {
  MdCodeBlock,
  MdCodeSpan,
  MdList,
  MdSpace,
  MdParagraph,
  MdHeading,
  MdText,
  At,
} from '../message'

export const headingRenderer: RendererPlugin<Tokens.Heading> = {
  type: 'heading',
  default(token) {
    return h('heading')
  },
  editor(token) {
    return h(MdHeading, { token, children: this.recursive(token.tokens) })
  },
  satori(token) {
    return Element('h')
  },
}
