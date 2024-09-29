import { h, VNode, resolveComponent } from 'vue'
import {
  Lexer,
  marked,
  Token,
  TokenizerExtensionFunction,
  Tokens,
  walkTokens,
  TokensList,
} from 'marked'
import { Context } from '@satorijs/core'
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
import { genId } from '@satorijs/plugin-im-utils'

export default function (ctx: Context) {}
