import { render } from "./render"
import { createVnode } from "./vnode"

export function createApp(rootComponent: any) {
  return {
    mount(rootContainer: any) {
      // 先转换成 vnode
      // component -》 vnode
      const vnode = createVnode(rootComponent)
      render(vnode, rootContainer)
    }
  }
}
