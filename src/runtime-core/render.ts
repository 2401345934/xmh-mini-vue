import { createComponentInstance, setupComponent } from "./components"

export function render(vnode: any, container: any) {
  // 这里只做调用 patch 方法  方便递归处理
  return patch(vnode, container)

}

function patch(vnode: any, container: any) {

  processComponent(vnode, container)
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
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

