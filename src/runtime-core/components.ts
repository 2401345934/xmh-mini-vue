import { shallowReadonly } from "../reactivity/reactive"
import { initProps } from "./componentProps"
import { emit } from "./componentsEmit"
import { initSlots } from "./componentsSlots"
import { publicInstanceProxyHandlers } from "./componentsPublicInstance"

export function createComponentInstance(vnode: any, parent: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    emit: () => { }
  }
  component.emit = emit.bind(null, component) as any

  return component
}

export function setupComponent(instance: any) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
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
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }
}

// 处理组件的 setup 的返回值
function handleSetupResult(instance: any, setupResult: any) {
  // object
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  // TODO:
  // function
  finisComponentSetup(instance)
}

// 处理组件的 setup
function finisComponentSetup(instance: any) {
  const Componet = instance.type

  if (Componet.render) {
    instance.render = Componet.render
  }
}


let currentInstance = null


export function getCurrentInstance(): any {
  return currentInstance
}

export function setCurrentInstance(instance: any): any {
  currentInstance = instance
} 