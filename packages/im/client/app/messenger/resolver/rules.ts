import { h, VNode, resolveComponent } from 'vue'
import {
  Lexer,
  marked,
  Tokens,
  TokenizerExtensionFunction,
  Tokenizer,
  TokenizerObject,
} from 'marked'
import { TokenizerPlugin, RendererPlugin } from './resolver'

declare module 'marked' {
  namespace Tokens {
    interface Component {
      type: 'component'
      raw: string
      text: string
    }

    interface At {
      type: 'at'
      raw: string
      name: string
    }
  }
}

export class ImTokenizer extends Tokenizer {
  constructor() {
    super()
  }
}

export const componentRule: TokenizerPlugin = {
  rule(this, src): Tokens.Component | undefined {
    const match = src.match(/\/(\{[^}]*\});/)
    if (match) {
      return {
        type: 'component',
        raw: match[0],
        text: match[1],
      } as any
    }
  },
}

export const atRule: TokenizerPlugin = {
  rule(this, src): Tokens.At | undefined {
    const match = src.match(/^@([^\s\n]*)/)

    if (match) {
      return {
        type: 'at',
        raw: match[0],
        name: match[1],
      }
    }
  },

  /* 
  FIXME: The ReturnType here is expected to ReturnType<TokenizerExtensionFunction>,
  but should actually be number.
*/
  // @ts-ignore
  locator(this, src) {
    const mentionPattern = /@([a-zA-Z0-9_]+)/g
    let match = mentionPattern.exec(src)
    if (match) {
      return match.index
    }
    return Infinity
  },
}
