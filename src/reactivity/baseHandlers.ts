import { extend, isObject } from "../shared"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"

// 初始化创建 防止重复创建
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly: boolean = false, shallow: boolean = false) {
  return function get(target: any, key: any) {
    const res = Reflect.get(target, key)
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    // shallow
    if (shallow) {
      return res
    }

    // 如果子元素还是 对象 递归处理
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    if (!isReadonly) {
      // 依赖收集
      track(target, key)
    }
    return res
  }
}


function createSetter() {
  return function set(target: any, key: any, value: any) {
    const res = Reflect.set(target, key, value)
    // 触发依赖
    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set
}



export const readonlyHandlers = {
  get: readonlyGet,
  set(target: any, key: any, value: any) {
    console.warn(`readonly no set ${key} - ${value} is ${target}`)
    return true
  }
}

export const shallowReadonlyHandle = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet
})