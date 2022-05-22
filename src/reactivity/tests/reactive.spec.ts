import { reactive, isReactive, isProxy } from "../reactive"
describe("reactive", () => {
  it('happy path', () => {
    const user = { name: '肖明辉' }
    const observe = reactive(user)
    expect(observe).not.toBe(user)
    expect(observe.name).toBe('肖明辉')

    expect(isReactive(observe)).toBe(true)
    expect(isReactive(user)).toBe(false)
    expect(isProxy(observe)).toBe(true)
    expect(isProxy(user)).toBe(false)
  })

  it('nested reactive', () => {
    const user = {
      six: {
        age: 10
      },
      len: [{ n: '张三' }]
    }
    const observer = reactive(user)
    expect(isReactive(observer.six)).toBe(true)
    expect(isReactive(observer.len)).toBe(true)
    expect(isReactive(observer.len[0])).toBe(true)
  })
})