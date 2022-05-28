import { createVnode, Fragment } from "../vnode";

export function renderSlots(slots: any, name: string, props: any = {}) {
  const slot = slots[name]
  if (slot) {
    if (typeof slot === 'function') {
      return createVnode(Fragment, {}, slot(props))
    }
  }
  return createVnode('div', {}, slots)
}