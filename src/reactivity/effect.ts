import { extend } from "../shared/index";


// 获取 fn
let activeEffect: any;
let shouldTrack: any = false;

export class ReactiveEffect {
  private _fn: any
  public scheduler: Function | undefined
  public deps: any = [];
  public active: boolean = true
  public onStop?: Function

  constructor(fn: any, scheduler?: Function | undefined) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    // 收集依赖
    // shouldTarck 做区分
    // 如果当前 active  就不需要收集依赖 不启用 开关
    if (!this.active) {
      return this._fn()
    }
    // 启用开关 收集
    shouldTrack = true
    // 赋值全局变量
    activeEffect = this
    // 返回值 用于return
    const result = this._fn()

    // 关闭开关 重置
    shouldTrack = false

    return result
  }

  stop() {
    if (this.active) {
      clearUpEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }


}


const targetMap = new Map()


// 删除 dep
function clearUpEffect(effect: any) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  });
  effect.deps.length = 0
}

export function trackEffect(dep: any) {
  // 如果 依赖已经存在 不需要重复收集
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

// 收集依赖
export function track(target: any, key: any) {
  // 如果不是 track 中  不往下走
  if (!isTracking()) return

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
  trackEffect(dep)
}

// 是否正在 track 中
export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}


export function triggerEffect(dep: any) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

// 触发依赖
export function trigger(target: any, key: any) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  triggerEffect(dep)
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