import { Fragment, Text } from './vnode';
import { ShapeFlags } from '../shared/ShapeFlags';
import { createComponentInstance, setupComponent } from "./components"
import { createAppApi } from './createApp';
import { effect } from '../reactivity/effect';


export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert
  } = options

  function render(vnode: any, container: any) {
    // 这里只做调用 patch 方法  方便递归处理
    return patch(null, vnode, container, null)
  }

  // n1 老的
  // n2 新的  
  function patch(n1: any, n2: any, container: any, parentComponent: any) {
    // 处理 element
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break;
      case Text:
        processText(n1, n2, container)
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFULE_COMPONENT) {
          // 处理 component
          processComponent(n1, n2, container, parentComponent)
        }
        break;
    }
  }


  function processText(n1: any, n2: any, container: any) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }

  function processComponent(n1: any, n2: any, container: any, parentComponent: any) {
    mountComponent(n2, container, parentComponent)
  }

  function processElement(n1: any, n2: any, container: any, parentComponent: any) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1: any, n2: any, container: any) {
    console.log(n1, 'n1')
    console.log(n2, 'n2')

  }

  function processFragment(n1: any, n2: any, container: any, parentComponent: any) {
    mountChildren(n2, container, parentComponent)
  }

  function mountElement(vnode: any, container: any, parentComponent: any) {
    const { type, children, props, shapeFlag } = vnode
    const el = vnode.el = hostCreateElement(type)
    // props
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    }

    // 设置属性
    for (const key in props) {
      const value = props[key]
      hostPatchProp(el, key, value)

    }
    hostInsert(el, container)
  }


  function mountChildren(vnode: any, container: any, parentComponent: any) {
    vnode.children.forEach((d: any) => {
      patch(null, d, container, parentComponent)
    })
  }


  function mountComponent(initialVnode: any, container: any, parentComponent: any) {
    const instance = createComponentInstance(initialVnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
  }


  // render effect
  function setupRenderEffect(instance: any, initialVnode: any, container: any) {
    effect(() => {
      if (!instance.isMounted) {
        // 虚拟节点树
        const { proxy } = instance
        const subTree = instance.subTree = instance.render.call(proxy)
        patch(null, subTree, container, instance)
        // 把组件的 根节点 挂载在  initialVnode 的 el
        initialVnode.el = subTree.el
        instance.isMounted = true
      } else {
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const preSubTree = instance.subTree
        instance.subTree = subTree
        patch(preSubTree, subTree, container, instance)
      }
    });
  }


  return {
    createApp: createAppApi(render)
  }
} 
