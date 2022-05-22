import { track, trigger } from "./effect"
import { ReactiveFlags } from "./reactive"

// 初始化创建 防止重复创建
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly: boolean = false) {
  return function get(target: any, key: any) {
    const res = Reflect.get(target, key)

    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
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