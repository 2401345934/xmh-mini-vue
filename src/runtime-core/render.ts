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


function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}


function setupRenderEffect(instance: any, container: any) {
  // 虚拟节点树
  const subTree = instance.render()
  patch(subTree, container)

}

function mountElement(vnode: any, container: any) {
  const { type, children, props } = vnode
  const el = document.createElement(type)
  // props
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(vnode, container)
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