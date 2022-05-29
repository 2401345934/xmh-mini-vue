import { getCurrentInstance } from "./components";

export function provide(key: string, value: any) {
  const instance: any = getCurrentInstance()
  if (instance) {
    let { provides } = instance
    const parentProvides = instance.parent?.provides
    if (provides === parentProvides) {
      provides = instance.provides = Object.create(parentProvides)
    }

    provides[key] = value
  }
}
export function inject(key: any, defaultValue: any) {
  const instance: any = getCurrentInstance()

  if (instance) {
    const { parent: { provides } } = instance
    if (key in provides) {
      return provides[key]
    } else if (typeof defaultValue === 'function') {
      return defaultValue()
    } else {
      return defaultValue
    }
  }
}