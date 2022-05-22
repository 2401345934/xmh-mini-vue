import { mutableHandlers, readonlyHandlers } from "./baseHandlers";



export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

export function reactive(raw: any) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw: any) {
  return createActiveObject(raw, readonlyHandlers)
}

function createActiveObject(raw: any, baseHandle: any) {
  return new Proxy(raw, baseHandle)
}

export function isReactive(value: any) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}


export function isReadonly(value: any) {
  return !!value[ReactiveFlags.IS_READONLY]

}
