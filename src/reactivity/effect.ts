import { extend } from "../shared";


// 获取 fn
let activeEffect: any;
let shouldTrack: any;

class ReactiveEffect {
  private _fn: any
  public scheduler: Function | undefined
  public deps: any;
  public active: boolean = true
  public onStop?: Function

  constructor(fn: any, scheduler: Function | undefined) {
    this._fn = fn
    this.scheduler = scheduler
    this.deps = []
  }

  run() {

    // 收集依赖
    // shouldTarck 做区分
    if (!this.active) {
      return this._fn()
    }

    shouldTrack = true

    activeEffect = this

    const result = this._fn()

    shouldTrack = false

    return result
  }

  stop() {
    if (this.active) {
      this.clearUpEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }

  // 删除 dep
  clearUpEffect(effect: any) {
    effect.deps.forEach((dep: any) => {
      dep.delete(effect)
    });
  }
}



const targetMap = new Map()
// 收集依赖
export function track(target: any, key: any) {
  // target -> key -> dep
  let depsMap = targetMap.get(target)
  // 初始化的时候 处理
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  // 如果只是单纯的 收集依赖 没有 effect 就不需要 往下走
  if (!activeEffect) return
  if (!shouldTrack) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}


// 触发依赖
export function trigger(target: any, key: any) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)

  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }

}


export function effect(fn: any, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)

  // extend
  extend(_effect, options)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner: any) {
  runner.effect.stop()
}