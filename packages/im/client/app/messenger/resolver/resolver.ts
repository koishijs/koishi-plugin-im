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
import { Element } from '@satorijs/core'
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
import { ImTokenizer, atRule } from './rules'
import { genId } from '@satorijs/plugin-im-utils'

export type Renderer<T, R> = (token: T) => R

export interface RendererPlugin<T> {
  type: string
  default: Renderer<T, VNode>
  editor: Renderer<T, VNode>
  satori: Renderer<T, Element>
}

export interface TokenizerPlugin {
  rule: TokenizerExtensionFunction
  locator?: TokenizerExtensionFunction
}

const renderers: RendererPlugin<Tokens.Generic>[] = []
const inlinePlugins: TokenizerPlugin[] = []
const blockPlugins: TokenizerPlugin[] = []

class TextResolver {
  _inlinePlugins: TokenizerExtensionFunction[] = []
  _blockPlugins: TokenizerExtensionFunction[] = []

  get _tokenizer() {
    return (text: string): Token[] => {
      if (!text)
        return [
          {
            type: 'paragraph',
            raw: '',
            text: '',
          },
        ]
      return marked.lexer(text, {
        tokenizer: new ImTokenizer(),
        extensions: {
          inline: this._inlinePlugins,
          block: this._blockPlugins,
          startInline: [],
        } as any,
      })
    }
  }

  constructor(public editMode: boolean) {}

  withInlinePlugin(...plugins: TokenizerExtensionFunction[]) {
    this._inlinePlugins.push(...plugins)
  }

  withBlockPlugin(...plugins: TokenizerExtensionFunction[]) {
    this._blockPlugins.push(...plugins)
  }

  resolveLine(content: string): VNode {
    console.log(this._tokenizer(content))
    console.log(marked(content))
    return h('div', this._resolveChildren(this._tokenizer(content)))
  }

  resolveContent(content: string): VNode[] {
    console.log(this._tokenizer(content))
    console.log(marked(content))
    console.log(this._resolveChildren(this._tokenizer(content)))
    return this._resolveChildren(this._tokenizer(content))
  }

  resolveToken(token: Token): VNode | null {
    if (token.type === 'at') {
      return h(At, { token })
    } else if (token.type === 'component') {
      console.log(token)
      const obj = JSON.parse(token.text)
      const { name, ...args } = obj
      if (!resolveComponent(name)) {
        h('text', token.text)
      }
      return h(resolveComponent(name), { ...args })
    } else if (token.type === 'code') {
      return h(MdCodeBlock, { token })
    } else if (token.type === 'codespan') {
      return h(MdCodeSpan, { text: token.raw })
    } else if (token.type === 'paragraph') {
      // HACK: Use genId() to force an update to resolve the IME problem.
      return h(MdParagraph, { token, children: this._resolveChildren(token.tokens!) })
    } else if (token.type === 'image') {
      return h(resolveComponent('md-image'), { src: token.href })
    } else if (token.type === 'blockquote') {
      return h('blockquote', this._resolveChildren(token.tokens!)) // TODO
    } else if (token.type === 'text') {
      return h(MdText, { text: token.text })
    } else if (token.type === 'em') {
      const children = this._resolveChildren(token.tokens!)
      return h('em', this.editMode ? ['*', ...children, '*'] : children)
    } else if (token.type === 'strong') {
      const children = this._resolveChildren(token.tokens!)
      return h('b', this.editMode ? ['**', ...children, '**'] : children)
    } else if (token.type === 'del') {
      return h('del', this._resolveChildren(token.tokens!))
    } else if (token.type === 'link') {
      return h('a', { href: token.href }, this._resolveChildren(token.tokens!))
    } else if (token.type === 'space') {
      return h(MdSpace, { text: token.raw })
    } else if (token.type === 'list') {
      return h(MdList, { token })
    } else if (token.type === 'heading') {
      return h(MdHeading, { token, children: this._resolveChildren(token.tokens!) })
    }
    return h('text', token.raw)
  }

  _resolveChildren(tokens: Token[]): VNode[] {
    if (!tokens) {
      console.log('no tokens')
      return []
    }
    return tokens.map((token) => this.resolveToken(token)).filter(Boolean) as VNode[]
  }
}

// export function registerRenderer(renderer: Renderer) {
//   renderers.push(renderer)
// }

export function registerInlineTokenizer(tokenizer: TokenizerPlugin) {}

export function registerBlockTokenizer(tokenizer: TokenizerPlugin) {}

export default TextResolver
