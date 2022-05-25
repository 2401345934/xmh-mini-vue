const publicPropsMap = {
  $el: (i: any) => {
    return i.vnode.el
  }
}


export const publicInstanceProxyHandlers = {
  get({ _: instance }: any, key: any) {
    const { setupState } = instance
    // 实现代理 this setupState
    if (key in setupState) {
      return setupState[key]
    }
    // 实现 $el
    if (publicPropsMap[key]) {
      return publicPropsMap[key](instance)
    }
  }
}