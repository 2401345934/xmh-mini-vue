import { ReactiveEffect } from './effect';


class ComputedRefImpl {
  // lazy
  private _dirty: boolean = true;
  // 缓存的 value
  private _value: any;
  // effct 依赖
  private _effect: any;

  constructor(getter: any) {
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }

  set value(newVal: any) {
    if (newVal === this._value) {
      return
    }

  }
}

export function computed(fn: any) {
  return new ComputedRefImpl(fn)
}