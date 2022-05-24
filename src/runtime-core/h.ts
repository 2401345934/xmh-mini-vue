import { createVnode } from "./vnode";
//  h 只是 createVnode 的别名
export function h(type: any, props?: any, children?: any) {
  return createVnode(type, props, children)
}