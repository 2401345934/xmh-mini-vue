import { ShapeFlags } from "../shared/ShapeFlags"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVnode(type: any, props?: any, children?: any) {

  const vnode = {
    type,
    props,
    children,
    el: null,
    key: props && props.key,
    shapeFlag: getShapeFlag(type),
  }

  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  if (vnode.shapeFlag & ShapeFlags.STATEFULE_COMPONENT) {
    if (typeof children === 'object') {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILREN
    }
  }

  return vnode

}

function getShapeFlag(type: any) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFULE_COMPONENT
}



export function createTextVnode(text: string) {
  return createVnode(Text, {}, text)
}