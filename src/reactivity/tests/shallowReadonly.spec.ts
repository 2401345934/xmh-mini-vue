
import { shallowReadonly, isReadonly } from "../reactive"

describe("shallowReadonly", () => {
  it('shallowReadonly', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)
  })
  it('set readonly  warn', () => {
    console.warn = jest.fn()
    // not set
    const observe = shallowReadonly({
      age: 10
    })
    observe.age = 111
    expect(console.warn).toBeCalled()
  })

})