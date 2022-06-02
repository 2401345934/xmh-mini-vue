// assign
export const extend = Object.assign

// 是否是对象
export const isObject = (obj: any) => {
  return obj !== null && typeof obj === 'object'
}

// 值是否有改变
export const hasChange = (value: any, newValue: any) => {
  return !Object.is(value, newValue)

}

export const EMPTY_OBJ = {}


// 是否是 k in obj
export const hasOwn = (obj: any, k: any) => Object.prototype.hasOwnProperty.call(obj, k)

// 是否带有on
export const isOn = (key: string) => /^on[A-Z]/.test(key)


// 首字母大写
export const capitalize = (str: string) => {
  return str ? str.charAt(0).toLocaleUpperCase() + str.slice(1) : ''
}

// 拼接 on
export const toHandleKey = (str: string) => str ? 'on' + capitalize(str) : ''

// 把 - 拼接 转换成 驼峰
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toLocaleUpperCase() : ''
  })
}