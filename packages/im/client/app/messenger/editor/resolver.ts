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
  MdEmphasis,
  MdList,
  MdSpace,
  MdParagraph,
  MdHeading,
  MdStrong,
  MdText,
  At,
} from '../message'
import { ImTokenizer, atRule, atFinder } from './md-rules'
import { genId } from '@satorijs/plugin-im-utils'

interface Renderer {
  default: <T>(token: T) => VNode
  editor: <T>(token: T) => VNode
  compliant: <T>(token: T) => Element
}

const renderers: Renderer[] = []
const inlinePlugins: TokenizerPlugin[] = []
const blockPlugins: TokenizerPlugin[] = []

interface TokenizerPlugin {
  rule: TokenizerExtensionFunction
  locator: TokenizerExtensionFunction | undefined
}

class TextResolver {
  _inlinePlugins: TokenizerExtensionFunction[] = [atRule]
  _blockPlugins: TokenizerExtensionFunction[] = []

  get _tokenizer() {
    return (text: string): Token[] => {
      return marked.lexer(text, {
        tokenizer: new ImTokenizer(),
        extensions: {
          inline: this._inlinePlugins,
          block: this._blockPlugins,
          startInline: [atFinder],
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
    return h('div', this._resolveChildren(this._tokenizer(content)))
  }

  resolveContent(content: string): VNode[] {
    console.log(this._tokenizer(content))
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
      return h(MdEmphasis, { token, children })
    } else if (token.type === 'strong') {
      const children = this._resolveChildren(token.tokens!)
      return h(MdStrong, { token, children })
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
    if (!tokens.length) {
      return []
    }
    return tokens.map((token) => this.resolveToken(token)).filter(Boolean) as VNode[]
  }
}

export function registerRenderer(renderer: Renderer) {
  renderers.push(renderer)
}

export function registerInlineTokenizer(tokenizer: TokenizerPlugin) {}

export function registerBlockTokenizer(tokenizer: TokenizerPlugin) {}

export default TextResolver
