import { isObject } from './../shared/index';
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandle } from "./baseHandlers";

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


export function shallowReadonly(raw: any) {
  return createActiveObject(raw, shallowReadonlyHandle)
}

function createActiveObject(raw: any, baseHandle: any) {
  if (!isObject(raw)) {
    console.warn("target is not object")
    return
  }
  return new Proxy(raw, baseHandle)
}

export function isReactive(value: any) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value: any) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value: any) {
  return isReactive(value) || isReadonly(value)
}