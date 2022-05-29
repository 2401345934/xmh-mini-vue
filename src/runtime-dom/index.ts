import { createRenderer } from "../runtime-core/index"
import { isOn } from "../shared/index"



function createElement(type: any) {
  return document.createElement(type)
}

function insert(el: any, parent: any) {
  parent.append(el)
}

function patchProp(el: any, key: any, value: any) {
  if (isOn(key)) {
    el.addEventListener(key.slice(2).toLocaleLowerCase(), value)
  } else {
    el.setAttribute(key, value)
  }
}

const renderer: any = createRenderer({
  createElement,
  insert,
  patchProp
})

export function createApp(...args: any[]) {
  return renderer.createApp(...args)
}

export * from "../runtime-core/index"
