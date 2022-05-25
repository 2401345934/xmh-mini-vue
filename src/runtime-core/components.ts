import { publicInstanceProxyHandlers } from "./componentsPublicInstance"

export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    el: null
  }

  return component
}

export function setupComponent(instance: any) {
  // TODO:
  // initProps()
  // TODO:
  // initSlots()
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Componet = instance.type
  // ctx
  instance.proxy = new Proxy(
    { _: instance },
    publicInstanceProxyHandlers
  )

  const { setup } = Componet
  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}


function handleSetupResult(instance: any, setupResult: any) {
  // object
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  // TODO:
  // function
  finisComponentSetup(instance)
}

function finisComponentSetup(instance: any) {
  const Componet = instance.type

  if (Componet.render) {
    instance.render = Componet.render
  }
}

