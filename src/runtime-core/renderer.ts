import { Fragment, Text } from './vnode';
import { ShapeFlags } from '../shared/ShapeFlags';
import { createComponentInstance, setupComponent } from "./components"
import { createAppApi } from './createApp';
import { effect } from '../reactivity/effect';
import { EMPTY_OBJ } from '../shared';


export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options

  function render(vnode: any, container: any) {
    console.log('---------------render----------------')
    // 这里只做调用 patch 方法  方便递归处理
    return patch(null, vnode, container, null)
  }

  // n1 老的
  // n2 新的  
  function patch(n1: any, n2: any, container: any, parentComponent: any) {
    console.log('---------------patch----------------')

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
    console.log('---------------processText----------------')
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }

  function processComponent(n1: any, n2: any, container: any, parentComponent: any) {
    console.log('---------------processComponent----------------')
    mountComponent(n2, container, parentComponent)
  }

  function processElement(n1: any, n2: any, container: any, parentComponent: any) {
    console.log('---------------processElement----------------')
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  function patchElement(n1: any, n2: any, container: any, parentComponent: any) {
    console.log('---------------patchElement----------------')
    console.log(n1, 'n1')
    console.log(n2, 'n2')

    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = n2.el = n1.el
    patchChildren(n1, n2, el, parentComponent)
    patchProps(el, oldProps, newProps)
  }


  function patchChildren(n1: any, n2: any, container: any, parentComponent: any) {
    console.log('---------------patchChildren----------------')
    const prevShapeFlag = n1.shapeFlag
    const nextShapeFlag = n2.shapeFlag
    const c1 = n1.children
    const c2 = n2.children
    // 新的 是文本   // 老的是数组
    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 老的是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新的 是文本  老的是 数组
        // 1. 老的children清空
        unmountChildren(c1)
        // 2. 设置 text
        hostSetElementText(container, c2)
      }
      // 新的 是文本  老的也是文本 文本不一样 就更新
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent)
      }

    }


  }


  function unmountChildren(chilren: any) {
    console.log('---------------unmountChildren----------------')

    for (let i = 0; i < chilren.length; i++) {
      const el = chilren[i].el
      hostRemove(el)
    }
  }



  function patchProps(el: any, oldProps: any, newProps: any) {

    console.log('---------------patchProps----------------')

    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
        // 新的props  不等于 老的 props  更新
        if (prevProp !== newProps) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        // 处理 如果老的 props 不在新的 props 里面 就是删除
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }

  }



  function processFragment(n1: any, n2: any, container: any, parentComponent: any) {
    console.log('---------------processFragment----------------')
    mountChildren(n2.children, container, parentComponent)
  }

  function mountElement(vnode: any, container: any, parentComponent: any) {
    console.log('---------------mountElement----------------')

    const { type, children, props, shapeFlag } = vnode
    const el = vnode.el = hostCreateElement(type)
    // props
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent)
    }

    // 设置属性
    for (const key in props) {
      const value = props[key]
      hostPatchProp(el, key, null, value)

    }
    hostInsert(el, container)
  }


  function mountChildren(children: any, container: any, parentComponent: any) {
    console.log('---------------mountChildren----------------')
    children.forEach((d: any) => {
      patch(null, d, container, parentComponent)
    })
  }


  function mountComponent(initialVnode: any, container: any, parentComponent: any) {
    console.log('---------------mountComponent----------------')

    const instance = createComponentInstance(initialVnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
  }


  // render effect
  function setupRenderEffect(instance: any, initialVnode: any, container: any) {
    console.log('---------------setupRenderEffect----------------')

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
