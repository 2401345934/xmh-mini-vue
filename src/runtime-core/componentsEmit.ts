import { camelize, toHandleKey } from "../shared/index"

export const emit = (instance: any, event: any, ...rest: any) => {
  const { props } = instance
  const handle = props[toHandleKey(camelize(event))]
  if (handle && typeof handle === 'function') {
    handle(...rest)
  }
}