import { reactive, isReactive } from "../reactive"
describe("reactive", () => {
  it('happy path', () => {
    const user = { name: '肖明辉' }
    const observe = reactive(user)
    expect(observe).not.toBe(user)
    expect(observe.name).toBe('肖明辉')

    expect(isReactive(observe)).toBe(true)
    expect(isReactive(user)).toBe(false)
  })
})