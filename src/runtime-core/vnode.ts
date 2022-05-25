import { ShapeFlags } from "../shared/ShapeFlags"

export function createVnode(type: any, props?: any, children?: any) {

  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type)
  }

  if (typeof children === 'string') {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN
  }
  return vnode

}

function getShapeFlag(type: any) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFULE_COMPONENT
}
