import { createVnode } from "./vnode"



export function createAppApi(render) {
  return function createApp(rootComponent: any) {
    return {
      mount(rootContainer: any) {
        // 先转换成 vnode
        // component -》 vnode
        const vnode = createVnode(rootComponent)
        // 转换成真实节点
        const container = document.querySelector(rootContainer)
        render(vnode, container)
      }
    }
  }
}
