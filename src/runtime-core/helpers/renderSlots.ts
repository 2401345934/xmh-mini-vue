import { createVnode } from "../vnode";

export function renderSlots(slots: any, name: string, props: any = {}) {
  const slot = slots[name]
  if (slot) {
    if (typeof slot === 'function') {
      return createVnode('div', {}, slot(props))
    }
  }

  return createVnode('div', slot)
}
