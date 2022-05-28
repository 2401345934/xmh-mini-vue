import { hasOwn } from "../shared/index"

const publicPropsMap = {
  $el: (i: any) => i.vnode.el,
  $slots: (i: any) => i.slots
}


export const publicInstanceProxyHandlers = {
  get({ _: instance }: any, key: any) {
    const { setupState, props } = instance
    // 实现代理 this setupState props
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }
    // 实现 $el
    if (publicPropsMap[key]) {
      return publicPropsMap[key](instance)
    }
  },
}