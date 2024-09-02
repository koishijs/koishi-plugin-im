import { h, VNode, resolveComponent } from 'vue'
import { marked, Token, TokenizerExtensionFunction } from 'marked'

export { Token, Tokens as TokenType } from 'marked'

const tagRegex = /^<(\/?)([^!\s>/]+)([^>]*?)\s*(\/?)>$/

const component: TokenizerExtensionFunction = function (this, src) {
  const match = src.match(/\/(\{[^}]*\});/)
  if (match) {
    return {
      type: 'component',
      raw: match[0],
      text: match[1],
    } as any
  }

  return false
}

export const tokenizer = (content: string): Token[] =>
  marked.lexer(content, {
    extensions: {
      inline: [component],
    } as any,
  })

export function renderer(tokens: Token[]): VNode[] {
  return tokens.map(renderToken).filter(Boolean)
}

export default function transform(content: string): VNode[] {
  if (!content) return [h('div')]
  return renderer(tokenizer(content))
}

function rendChilds(tokens: Token[]): VNode[] | undefined {
  if (!tokens) {
    console.log('no tokens')
    return undefined
  }
  return tokens.map(renderToken).filter(Boolean)
}

function renderToken(token: Token): VNode {
  if (token.type === 'component') {
    console.log(token)
    const obj = JSON.parse(token.text)
    const { name, ...args } = obj
    if (!resolveComponent(name)) {
      h('text', token.text)
    }
    return h(resolveComponent(name), { ...args })
  } else if (token.type === 'code') {
    return h('code', { content: token.text + '\n' })
  } else if (token.type === 'paragraph') {
    return h('p', {}, rendChilds(token.tokens!))
  } else if (token.type === 'image') {
    return h(resolveComponent('md-image'), { src: token.href })
  } else if (token.type === 'blockquote') {
    return h('blockquote', rendChilds(token.tokens!)) // TODO
  } else if (token.type === 'text') {
    return h('text', token.text)
  } else if (token.type === 'em') {
    return h('em', rendChilds(token.tokens!))
  } else if (token.type === 'strong') {
    return h('b', rendChilds(token.tokens!))
  } else if (token.type === 'del') {
    return h('del', rendChilds(token.tokens!))
  } else if (token.type === 'link') {
    return h('a', { href: token.href }, rendChilds(token.tokens!))
  }
  return h('p', token.raw)
}
