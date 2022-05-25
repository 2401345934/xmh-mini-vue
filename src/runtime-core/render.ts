import { isObject } from './../shared/index';
import { createComponentInstance, setupComponent } from "./components"

export function render(vnode: any, container: any) {
  // 这里只做调用 patch 方法  方便递归处理
  return patch(vnode, container)

}

function patch(vnode: any, container: any) {
  // 处理 element
  if (typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    // 处理 component 
    processComponent(vnode, container)
  }
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}



function mountElement(vnode: any, container: any) {
  const { type, children, props } = vnode
  const el = vnode.el = document.createElement(type)
  // props
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el)
  }
  // 设置属性
  for (const key in props) {
    const value = props[key]
    el.setAttribute(key, value)
  }
  container.append(el)
}



function mountChildren(vnode: any, container: any) {
  vnode.children.forEach((d: any) => {
    patch(d, container)
  })
}



function mountComponent(initialVnode: any, container: any) {
  const instance = createComponentInstance(initialVnode)
  setupComponent(instance)
  setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance: any, initialVnode: any, container: any) {
  // 虚拟节点树
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)

  // 把组件的 根节点 挂载在  initialVnode 的 el
  initialVnode.el = subTree.el

}