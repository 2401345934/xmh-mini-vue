export const extend = Object.assign

export const isObject = (obj: any) => {
  return obj !== null && typeof obj === 'object'
}

export const hasChange = (value: any, newValue: any) => {
  return !Object.is(value, newValue)

}