import { createRenderer } from "../runtime-core/index"
import { isOn } from "../shared/index"



function createElement(type: any) {
  return document.createElement(type)
}

function insert(el: any, parent: any) {
  parent.append(el)
}

function remove(el: any) {
  const parent = el.parentNode;
  if (parent) {
    parent.removeChild(el)
  }
}


function setElementText(el: any, text: string) {
  el.textContent = text

}

function patchProp(el: any, key: any, prevVal: any, nextVal: any) {
  if (isOn(key)) {
    el.addEventListener(key.slice(2).toLocaleLowerCase(), nextVal)
  } else if (nextVal === undefined || nextVal === null) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, nextVal)
  }
}

const renderer: any = createRenderer({
  createElement,
  insert,
  patchProp,
  remove,
  setElementText
})

export function createApp(...args: any[]) {
  return renderer.createApp(...args)
}

export * from "../runtime-core/index"
