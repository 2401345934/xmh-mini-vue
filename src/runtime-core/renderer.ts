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
    return patch(null, vnode, container, null, null)
  }

  // n1 老的
  // n2 新的  
  function patch(n1: any, n2: any, container: any, parentComponent: any, anchor: any) {
    console.log('---------------patch----------------')

    // 处理 element
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break;
      case Text:
        processText(n1, n2, container)
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFULE_COMPONENT) {
          // 处理 component
          processComponent(n1, n2, container, parentComponent, anchor)
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

  function processComponent(n1: any, n2: any, container: any, parentComponent: any, anchor: any) {
    console.log('---------------processComponent----------------')
    mountComponent(n2, container, parentComponent, anchor)
  }

  function processElement(n1: any, n2: any, container: any, parentComponent: any, anchor: any) {
    console.log('---------------processElement----------------')
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1: any, n2: any, container: any, parentComponent: any, anchor: any) {
    console.log('---------------patchElement----------------')
    console.log(n1, 'n1')
    console.log(n2, 'n2')

    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = n2.el = n1.el
    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }


  function patchChildren(n1: any, n2: any, container: any, parentComponent: any, anchor: any) {
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
        mountChildren(c2, container, parentComponent, anchor)

      } else {
        // array diff array
        patchKeyChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  // chilren 比较
  function patchKeyChildren(c1: any, c2: any, container: any, parentComponent: any, parentAnchour: any) {

    // 定义 索引   老的元素changed  新的元素长度
    let i = 0, l1 = c1.length, l2 = c2.length, e1 = l1 - 1, e2 = l2 - 1;

    // 双端对比 左侧
    // 索引 小于等于 新的长度 && 索引 小于等于 老的长度
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSomeVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchour)
      } else {
        break;
      }
      i++
    }

    // 双端对比 右侧
    // 索引 小于等于 新的长度 && 索引 小于等于 老的长度
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSomeVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchour)
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 新的比老的多  创建 
    // 左侧
    if (i > e1) {
      if (i <= e2) {
        const nextProps = e2 + 1
        const anchor = nextProps < l2 ? c2[nextProps].el : null
        while (i <= e2) {
          // add
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
      // 删除
    } else if (i > e2) {
      while (i <= e1) {
        // remove
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // 中间对比 乱序部分  记录 新的节点 是否需要移动
      let s1 = i, s2 = i, patched = 0, moved = false, maxNewIndex = 0;
      const toBePatched = e2 - s2 + 1
      // map 存储 key
      const keyToIndexMap = new Map()
      // 定长数组
      const newIndexToOldIndexMap = new Array(toBePatched)


      // 初始化
      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0
      }

      // 遍历新的
      for (let i = s2; i <= e2; i++) {
        // 新的节点
        const nextChild = c2[i]
        // key nextchild.key
        // value index
        keyToIndexMap.set(nextChild.key, i)
      }

      // 遍历老的
      for (let i = s1; i <= e1; i++) {
        // 如果 新节点 结束了 老节点 还有 直接结束
        if (patched >= toBePatched) {
          hostRemove(c1[i])
          container;
        }
        // 老的节点
        const prevChild = c1[i]
        // null  undefined
        let newIndex: any;
        if (prevChild.key !== null) {
          newIndex = keyToIndexMap.get(prevChild.key)
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSomeVnodeType(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(prevChild.el)
        } else {

          if (newIndex >= maxNewIndex) {
            maxNewIndex = newIndex
          } else {
            moved = true
          }

          newIndexToOldIndexMap[newIndex - s2] = i + 1
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }

      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
      let j = increasingNewIndexSequence.length - 1
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null


        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) {
          // 是否需要移动
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }

    }
  }

  function isSomeVnodeType(n1: any, n2: any): any {
    return n1.type === n2.type && n1.key === n2.key
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

  function processFragment(n1: any, n2: any, container: any, parentComponent: any, anchor: any) {
    console.log('---------------processFragment----------------')
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function mountElement(vnode: any, container: any, parentComponent: any, anchor: any) {
    console.log('---------------mountElement----------------')

    const { type, children, props, shapeFlag } = vnode
    const el = vnode.el = hostCreateElement(type)
    // props
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor)
    }

    // 设置属性
    for (const key in props) {
      const value = props[key]
      hostPatchProp(el, key, null, value)

    }
    hostInsert(el, container, anchor)
  }


  function mountChildren(children: any, container: any, parentComponent: any, anchor: any) {
    console.log('---------------mountChildren----------------')
    children.forEach((d: any) => {
      patch(null, d, container, parentComponent, anchor)
    })
  }


  function mountComponent(initialVnode: any, container: any, parentComponent: any, anchor: any) {
    console.log('---------------mountComponent----------------')

    const instance = createComponentInstance(initialVnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container, anchor)
  }


  // render effect
  function setupRenderEffect(instance: any, initialVnode: any, container: any, anchor: any) {
    console.log('---------------setupRenderEffect----------------')

    effect(() => {
      if (!instance.isMounted) {
        // 虚拟节点树
        const { proxy } = instance
        const subTree = instance.subTree = instance.render.call(proxy)
        patch(null, subTree, container, instance, anchor)
        // 把组件的 根节点 挂载在  initialVnode 的 el
        initialVnode.el = subTree.el
        instance.isMounted = true
      } else {
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const preSubTree = instance.subTree
        instance.subTree = subTree
        patch(preSubTree, subTree, container, instance, anchor)
      }
    });
  }


  return {
    createApp: createAppApi(render)
  }
}



// 递归求最长子序列
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
