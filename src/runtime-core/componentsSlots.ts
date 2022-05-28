import { ShapeFlags } from "../shared/ShapeFlags"

export function initSlots(instance: any, children: any) {
  const { vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILREN) {
    normalizeObjcetSlots(children, instance.slots)
  }
}

// 处理 slots 的值
function normalizeObjcetSlots(children: any, slots: any) {
  for (const k in children) {
    const v = children[k]
    slots[k] = (props: any) => normalizeSlotValue(v(props))
  }
}

// 处理 slots
function normalizeSlotValue(value: any) {
  return Array.isArray(value) ? value : [value]
}


