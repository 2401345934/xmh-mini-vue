export const enum ShapeFlags {
  // 是否 是 element  0 不是 1 是
  ELEMENT = 1,
  // 是否 是 component  0 不是 1 是
  STATEFULE_COMPONENT = 1 << 1,
  // 子元素 是否 是 text  0 不是 1 是
  TEXT_CHILDREN = 1 << 2,
  // 子元素 是否 是 array  0 不是 1 是
  ARRAY_CHILDREN = 1 << 3,
}