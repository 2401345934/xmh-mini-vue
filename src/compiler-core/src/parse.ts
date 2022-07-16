import { NodeTypes } from "./ast"

const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {


  const context = createParserContext(content)

  return createRoot(parseChildren(context, []))

}
function createRoot(children: any) {
  return {
    children
  }
}

function parseChildren(context: any, ancestors: any) {
  const nodes: any = []
  while (!isEnd(context, ancestors)) {
    let node: any
    const s = context.source
    //  {{}}
    if (s.startsWith("{{")) {
      node = parseInterpolation(context)
    } else if (s[0] === "<") {
      // element
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    }

    if (!node) {
      node = parseText(context)
    }
    nodes.push(node)
  }

  return nodes
}

function isEnd(context: any, ancestors: any) {
  // 2. 遇到结束标签
  const s = context.source
  if (s.startsWith(`</`)) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      if (startsWithEndTagOpen(s, tag)) {
        return true
      }
    }
  }
  // 1. source 有值

  return !s
}


function parseInterpolation(context: any) {
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - openDelimiter.length

  const rawContent = parseTextData(context, rawContentLength)

  const content = rawContent.trim()

  advanceBy(context, closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  }
}

function createParserContext(content: string) {
  return {
    source: content
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

function parseElement(context: any, ancestors: any) {
  const element: any = parseTag(context, TagType.Start)
  // 入栈
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  // 出栈
  ancestors.pop()

  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error(`缺少结束标签${element.tag}`)
  }

  return element
}


function startsWithEndTagOpen(source: any, tag: any) {

  return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag
}

function parseTag(context: any, type: TagType) {
  // 解析 tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]
  // 删除无用代码
  advanceBy(context, match[0].length)
  // 推进
  advanceBy(context, 1)

  if (type === TagType.End) return
  return {
    type: NodeTypes.ELEMENT,
    tag,
  }
}

function parseText(context: any): any {

  let endTokens = ["{{", "<"]
  let endIndex = context.source.length
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content
  }
}

function parseTextData(context: any, length: number) {
  // 获取 context
  const content = context.source.slice(0, length)
  // 推进
  advanceBy(context, content.length)
  return content
}