import { ref, VNode, nextTick, h } from 'vue'
import { debounce } from '../../../utils'
import EchoLink from './echolink'
import TextResolver from './resolver'

type Caret = {
  line: Range
  text: Range
  _node?: Range<Node> // HACK: _node will not update like Caret.line & Caret.text
  _offset?: Range
}
type Range<T = number> = { start: T; end: T }

function initCaret(): Caret {
  return {
    line: {
      start: 0,
      end: 0,
    },
    text: {
      start: 0,
      end: 0,
    },
  }
}

function isBlockElement(node: Node): boolean {
  return node instanceof HTMLElement && node.classList.contains('markdown-block')
}

function isInlineElement(node: Node): boolean {
  return node instanceof HTMLElement && node.classList.contains('markdown-inline')
}

function _isInline(inline: Node, node: Node): boolean {
  return inline.contains(node) || inline === node
}

function _isInBlock(block: Node, node: Node): boolean {
  return block.contains(node) || block === node
}

function _isBlockAtLastLine(root: Node, node: Node): boolean {
  return node.parentElement === root && (root.lastChild?.contains(node) || root.lastChild === node)
}

export class Editor {
  keyListener: EchoLink
  mdResolver: TextResolver

  _raws: string[] = ['']
  _caret: Caret = initCaret()
  cursorOffset: number = 0

  composition = {
    composing: false,
    text: '',
  }

  result = ref<VNode[]>([])

  get raw(): string {
    return this._raws.join('\n')
  }

  get caret(): Caret {
    this.secureCaret()
    return this._caret
  }

  get _lineElements(): Node[] {
    return Array.from(this.ref.childNodes).filter((node) => node.nodeName === 'DIV')
  }

  constructor(public ref: HTMLElement) {
    this.keyListener = new EchoLink(ref)
    this.mdResolver = new TextResolver(true)

    document.addEventListener(
      'selectionchange',
      debounce(() => {
        const selection = window.getSelection()!

        if (
          this.ref.contains(selection.getRangeAt(0).commonAncestorContainer) &&
          !this.composition.composing
        ) {
          this._caret = this.getCaret(selection)!
        }
      }, 100)
    )

    this.ref.addEventListener('paste', (event) => {
      const text = event.clipboardData?.getData('text/plain') || ''

      const pos = this._caret
      if (pos.line.start !== pos.line.end || pos.text.start !== pos.text.end) {
        this.deleteInRaw()
      }

      this.insertInRaw(text)
      this._updateText()
      event.preventDefault()
    })

    this.ref.addEventListener('cut', (event) => {
      const selected = window.getSelection()?.toString()!
      event.clipboardData?.setData('text/plain', selected)
      this.deleteInRaw()
      this._updateText()
      event.preventDefault()
    })

    this.ref.addEventListener('compositionstart', async (event) => {
      this.composition.composing = true

      event.preventDefault()
    })

    this.ref.addEventListener('compositionupdate', (event) => {
      this.composition.text = event.data
    })

    this.ref.addEventListener('compositionend', (event) => {
      this.insertInRaw(this.composition.text || '')

      this.composition.composing = false
      this.composition.text = ''

      this._updateText()
    })

    this.keyListener.onBeforeInput('insertCompositionText', (event) => {})

    this.keyListener.onBeforeInput('deleteContentBackward', (event) => {
      this.deleteInRaw()
      this._updateText()
      event.preventDefault()
    })

    this.keyListener.onBeforeInput('insertParagraph', (event) => {
      this.insertInRaw('\n')
      this._updateText()
      event.preventDefault()
    })

    this.keyListener.onBeforeInput('*', (event) => {
      const pos = this._caret

      if (pos.line.start !== pos.line.end || pos.text.start !== pos.text.end) {
        this.deleteInRaw()
      }

      if (!this.composition.composing) {
        this.insertInRaw(event.data || '')
      }

      this._updateText()

      event.preventDefault()
    })

    this.keyListener.onInput((event) => {
      console.warn(event)

      this.resetCaret()
    })

    this.keyListener.onKeyDown('Tab', (event) => {
      this.insertInRaw('    ')
      this._updateText()
      event.preventDefault()
    })

    this.keyListener.start()

    this._updateText().then(() => {
      this.resetCaret()
    })
  }

  editorWalker = (root: Node) => {
    let inlineStack: Node[] = []

    return document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      (node) => {
        const currentInline = inlineStack[inlineStack.length - 1]
        let flag: number = NodeFilter.FILTER_SKIP
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (isInlineElement(node)) {
            inlineStack.push(node)
          }

          flag = NodeFilter.FILTER_ACCEPT
        } else if (node.nodeType === Node.TEXT_NODE) {
          if (currentInline && _isInline(currentInline, node)) {
            flag = NodeFilter.FILTER_ACCEPT
          } else if (!this.composition.composing && node.textContent) {
            console.warn('illegal element detected')
            node.textContent = ''
            flag = NodeFilter.FILTER_REJECT
          }

          if (currentInline && currentInline.lastChild === node) {
            console.log(node)
            inlineStack.splice(-1)
          }
        }

        return flag
      }
    )
  }

  // This operation will trigger asynchronous Vue DOM updates. After calling this method,
  // nextTick() must be called to ensure that the DOM has been updated before performing
  async _updateText() {
    this.result.value = this.mdResolver.resolveContent(this.raw)
    await nextTick()
  }

  resetContent() {
    this._raws = ['']

    this._updateText()
    this._caret = initCaret()
  }

  getCaret(selection: Selection): Caret | null {
    if (!selection) return null

    function reorderSelection(selection: Selection) {
      const anchorNode = selection.anchorNode
      const anchorOffset = selection.anchorOffset
      const focusNode = selection.focusNode
      const focusOffset = selection.focusOffset

      const isAnchorBeforeFocus =
        anchorNode === focusNode
          ? anchorOffset < focusOffset
          : (document.compareDocumentPosition(anchorNode!) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0

      if (!isAnchorBeforeFocus) {
        return {
          startNode: focusNode,
          startOffset: focusOffset,
          endNode: anchorNode,
          endOffset: anchorOffset,
        }
      }

      return {
        startNode: anchorNode,
        startOffset: anchorOffset,
        endNode: focusNode,
        endOffset: focusOffset,
      }
    }

    const reordered = reorderSelection(selection)

    const result: Caret = {
      line: {
        start: this._lineElements.length - 1,
        end: this._lineElements.length - 1,
      },
      text: {
        start: 0,
        end: 0,
      },
      _node: {
        start: reordered.startNode!,
        end: reordered.endNode!,
      },
      _offset: {
        start: reordered.startOffset,
        end: reordered.endOffset,
      },
    }

    const walker = this.editorWalker(this.ref)
    let current: Node | null = null
    let lastBlock: Node | null = null
    let count = 0

    let flag = [false, false]
    while ((current = walker.nextNode()) && !flag.every(Boolean)) {
      if (
        lastBlock &&
        !_isInBlock(lastBlock, current) &&
        !_isBlockAtLastLine(this.ref, lastBlock)
      ) {
        count += 1
        lastBlock = null
      }

      if (isBlockElement(current)) {
        lastBlock = current
      }

      if (current.nodeType === Node.TEXT_NODE) {
        if (current === result._node!.start) {
          result.text.start = count + result._offset!.start
          flag[0] = true
        }
        if (current === result._node!.end) {
          result.text.end = count + result._offset!.end
          flag[1] = true
        }

        count += current.textContent?.length || 0
      }
    }

    result.line.start = 0
    result.line.end = 0

    console.log(`Recorded caret. At: ${JSON.stringify(result)}`)

    return result
  }

  resetCaret() {
    this.setCaret(this._caret.line, this._caret.text)
  }

  setCaret(line: Range, offset: Range) {
    this.secureCaret(line, offset)

    const range = document.createRange()
    const selection = window.getSelection()
    if (!selection) return

    const absolute = (line: number, offset: number): number =>
      this._raws.slice(0, line).reduce((sum, str) => sum + str.length, 0) + offset

    const start = this._walkLine(this.ref, absolute(line.start, offset.start))
    const end =
      line.start === line.end && offset.start === offset.end
        ? start
        : this._walkLine(this.ref, absolute(line.end, offset.end))

    range.setStart(start.node, start.offset)
    range.setEnd(end.node, end.offset)

    selection.removeAllRanges()
    selection.addRange(range)

    console.log(`Caret settled. line: ${line.start}, offset: ${offset.start}`)
  }

  deleteInRaw() {
    const lineStart = this.caret.line.start
    const lineEnd = this.caret.line.end
    const offsetStart = this.caret.text.start
    const offsetEnd = this.caret.text.end
    const rawArray = this._raws

    // multiple selection
    if (offsetStart !== offsetEnd || lineStart !== lineEnd) {
      if (lineStart !== lineEnd) {
        rawArray[lineStart] = rawArray[lineStart].slice(0, offsetStart)
        rawArray[lineEnd] = rawArray[lineEnd].slice(offsetEnd)
        rawArray.splice(lineStart + 1, lineEnd - lineStart - 1)
      } else {
        rawArray[lineStart] =
          rawArray[lineStart].slice(0, offsetStart) + rawArray[lineStart].slice(offsetEnd)
      }

      this.caret.text.start = this.caret.text.end = offsetStart
      this.caret.line.start = this.caret.line.end = lineStart
      return
    }

    // single selection
    if (offsetStart <= 0) {
      if (lineStart === 0) return

      const previous = lineStart - 1
      this.caret.text.start = this.caret.text.end = rawArray[previous].length
      rawArray[previous] += rawArray[lineStart]
      rawArray.splice(lineStart, 1)
      this.caret.line.start = this.caret.line.end = previous
    } else {
      if (offsetStart === rawArray[lineStart].length) {
        rawArray[lineStart] = rawArray[lineStart].slice(0, offsetStart - 1)
      } else {
        rawArray[lineStart] =
          rawArray[lineStart].slice(0, offsetStart - 1) + rawArray[lineStart].slice(offsetStart)
      }
      this.caret.text.end = this.caret.text.start -= 1
    }
  }

  insertInRaw(text: string) {
    const index = this.caret.line.start
    const offset = this.caret.text.start
    const rawArray = this._raws

    const beforeText = rawArray[index].slice(0, offset)
    const afterText = rawArray[index].slice(offset)

    rawArray[index] = beforeText + text + afterText

    console.log(this._raws)

    this.moveCaret({ x: text.length })
  }

  // This method could parse abstractive text line to concrete location of node.
  // values must be ensured to be safe, or call secureCaret() before the method.
  _walkLine(line: number, offset: number): any
  _walkLine(root: Node, offset: number): any
  _walkLine(lineOrNode: number | Node, offset: number) {
    const root = typeof lineOrNode === 'number' ? this._lineElements[lineOrNode] : lineOrNode
    const walker = this.editorWalker(root)

    let count = 0
    let current: Node | null = null
    let lastBlock: Node | null = null
    while ((current = walker.nextNode())) {
      if (
        lastBlock &&
        !_isInBlock(lastBlock, current) &&
        !_isBlockAtLastLine(this.ref, lastBlock)
      ) {
        count += 1
        lastBlock = null
      }

      if (isBlockElement(current)) {
        lastBlock = current
      }

      if (current.nodeType === Node.TEXT_NODE) {
        const length = current.textContent?.length || 0

        if (offset <= length + count) {
          break
        }

        count += length
      }
    }

    if (!current) {
      current = root
      // while (root.lastChild) {
      //   current = root.lastChild
      // }
    }

    return {
      node: current,
      offset: Math.min(offset - count, current.textContent?.length || Number.MAX_SAFE_INTEGER),
    }
  }

  moveCaret(offset: { y?: number; x?: number }) {
    let caret = this._caret
    let y = caret.line.start + (offset.y || 0)
    let x = caret.text.start + (offset.x || 0)

    const yLength = this._raws.length
    if (y < 0) {
      y = 0
      x = 0
    } else if (y >= yLength) {
      y = yLength - 1
      x = this._raws[y].length
    }

    let xLength = this._raws[y].length

    while (offset.x && (x < 0 || x > xLength)) {
      const direction = Math.sign(x)

      y += direction
      if (y < 0) {
        y = 0
        x = 0
        break
      } else if (y >= yLength) {
        y = yLength - 1
        x = xLength
        break
      }

      const next = this._raws[y].length

      if (x < 0) {
        x -= (next + 1) * direction
      } else {
        x -= (xLength + 1) * direction
      }

      xLength = next
    }

    caret.line.start = y
    caret.line.end = caret.line.start
    caret.text.start = x
    caret.text.end = caret.text.start
    console.log(`Caret moved. y: ${offset.y}, x: ${offset.x}`)
  }

  secureCaret(): void
  secureCaret(y: Range, x: Range): void
  secureCaret(y?: Range, x?: Range) {
    const yLength = this._raws.length - 1

    y || (y = this._caret.line)
    x || (x = this._caret.text)

    y.start = secure(y.start, yLength)
    y.end = secure(y.end, yLength)

    const xStartLength = this._raws[y.start].length
    const xEndLength = this._raws[y.end].length
    x.start = secure(x.start, xStartLength)
    x.end = secure(x.end, xEndLength)

    function secure(index: number, length: number): number {
      if (index >= 0 || index <= length) {
        return index
      }
      console.warn('out of range')
      return index < 0 ? 0 : length
    }
  }
}
