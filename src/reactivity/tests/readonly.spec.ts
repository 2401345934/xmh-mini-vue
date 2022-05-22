import { readonly, isReadonly, isProxy } from "../reactive"

describe('readonly', () => {
  it('happy path readonly', () => {
    // not set
    const user = { name: '肖明辉', len: [{ a: 1 }] }
    const observe = readonly(user)
    expect(observe).not.toBe(user)
    expect(observe.name).toBe('肖明辉')
  })

  it('set readonly  warn', () => {
    console.warn = jest.fn()
    // not set
    const observe = readonly({
      age: 10
    })
    observe.age = 111
    expect(console.warn).toBeCalled()
  })


  it('is readonly', () => {
    // not set
    const user = { name: '肖明辉', len: [{ a: 1 }] }
    const observe = readonly(user)
    expect(isProxy(observe)).toBe(true)
    expect(isReadonly(observe)).toBe(true)
    expect(isReadonly(user)).toBe(false)
    expect(isReadonly(observe.len)).toBe(true)
  })
})