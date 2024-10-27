import { h, VNode, resolveComponent } from 'vue'
import { marked, Token, TokenizerExtensionFunction } from 'marked'

export { Token, Tokens as TokenType } from 'marked'

export { default as MdEmphasis } from './emphasis.vue'
export { default as MdStrong } from './strong.vue'
export { default as MdImage } from './image.vue'
export { default as MdCodeSpan } from './code-span.vue'
export { default as MdCodeBlock } from './code-block.vue'
export { default as MdList } from './list.vue'
export { default as MdSpace } from './space.vue'
export { default as MdParagraph } from './paragraph.vue'
export { default as MdHeading } from './heading.vue'
export { default as At } from './at.vue'
export { default as MdText } from './text.vue'

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

function rendChildren(tokens: Token[]): VNode[] | undefined {
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
    return h('code', token.text + '\n')
  } else if (token.type === 'codespan') {
    return h('code', { text: token.raw })
  } else if (token.type === 'paragraph') {
    return h('div', rendChildren(token.tokens!))
  } else if (token.type === 'image') {
    return h(resolveComponent('md-image'), { src: token.href })
  } else if (token.type === 'blockquote') {
    return h('blockquote', rendChildren(token.tokens!))
  } else if (token.type === 'text') {
    return h('text', token.text)
  } else if (token.type === 'em') {
    return h('em', rendChildren(token.tokens!))
  } else if (token.type === 'strong') {
    return h('b', rendChildren(token.tokens!))
  } else if (token.type === 'del') {
    return h('del', rendChildren(token.tokens!))
  } else if (token.type === 'link') {
    return h('a', { href: token.href }, rendChildren(token.tokens!))
  }
  return h('div', token.raw)
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
  if (!content) return [h('text')]
  return renderer(tokenizer(content))
}
