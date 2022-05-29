import { Fragment, Text } from './vnode';
import { ShapeFlags } from '../shared/ShapeFlags';
import { isOn } from './../shared/index';
import { createComponentInstance, setupComponent } from "./components"

export function render(vnode: any, container: any) {
  // 这里只做调用 patch 方法  方便递归处理
  return patch(vnode, container, null)

}

function patch(vnode: any, container: any, parentComponent: any) {
  // 处理 element
  const { type, shapeFlag } = vnode;
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break;
    case Text:
      processText(vnode, container)
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFULE_COMPONENT) {
        // 处理 component
        processComponent(vnode, container, parentComponent)
      }
  }

}

function processComponent(vnode: any, container: any, parentComponent: any) {
  mountComponent(vnode, container, parentComponent)
}

function processElement(vnode: any, container: any, parentComponent: any) {
  mountElement(vnode, container, parentComponent)
}


function processFragment(vnode: any, container: any, parentComponent: any) {
  mountChildren(vnode, container, parentComponent)
}


function mountElement(vnode: any, container: any, parentComponent: any) {
  const { type, children, props, shapeFlag } = vnode
  const el = vnode.el = document.createElement(type)
  // props
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent)
  }

  // 设置属性
  for (const key in props) {
    const value = props[key]
    if (isOn(key)) {
      el.addEventListener(key.slice(2).toLocaleLowerCase(), value)
    } else {
      el.setAttribute(key, value)
    }
  }
  container.append(el)
}



function mountChildren(vnode: any, container: any, parentComponent: any) {
  vnode.children.forEach((d: any) => {
    patch(d, container, parentComponent)
  })
}



function mountComponent(initialVnode: any, container: any, parentComponent: any) {
  const instance = createComponentInstance(initialVnode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance: any, initialVnode: any, container: any) {
  // 虚拟节点树
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container, instance)

  // 把组件的 根节点 挂载在  initialVnode 的 el
  initialVnode.el = subTree.el
}

function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = vnode.el = document.createTextNode(children)
  container.append(textNode)
}
