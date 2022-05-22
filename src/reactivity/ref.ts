import { isObject } from './../shared/index';
import { hasChange } from "../shared";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";


class RefImpl {
  private _value: any;
  public dep: any;
  private _rawValue: any;
  public __v_isRef: any
  constructor(value: any) {
    // value 是不是对象 如果是对象  使用 reactive
    this._rawValue = value;
    this.__v_isRef = true
    this._value = convert(value)
    this.dep = new Set()
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newVal: any) {
    // 如果一样 直接 return
    // 如果对象 对比
    if (!hasChange(newVal, this._rawValue)) return
    this._rawValue = newVal
    this._value = convert(newVal)
    triggerEffect(this.dep)
  }
}

function convert(val: any) {
  return isObject(val) ? reactive(val) : val
}

function trackRefValue(refRaw: any) {
  if (isTracking()) {
    // 收集依赖
    trackEffect(refRaw.dep)
  }
}

export function ref(value: any) {
  return new RefImpl(value)
}

// 返回 是否是 ref
export function isRef(ref: any) {
  return !!ref.__v_isRef
}

// 返回 ref 的value 值
export function unRef(value: any) {
  return isRef(value) ? value._value : value
}


export function proxyRefs(objectWithRefs: any) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      // 如果 是 ref  替换掉 不是  的话 就修改他的 .value
      // 原来 是 ref  并且 新值 不是 ref  修改原来的 ref 和新的值
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }

    }
  })
}


