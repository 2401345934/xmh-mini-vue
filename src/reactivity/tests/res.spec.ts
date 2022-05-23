import { effect } from "../effect"
import { reactive, } from "../reactive"
import { ref, isRef, unRef, proxyRefs } from "../ref"

describe('reactivity/ref', () => {
  it('path', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })


  it('should be reactive', () => {
    const a = ref(1)
    let dummy;
    let calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  it('should make nested propersiss', () => {
    const a = ref({
      count: 1
    })
    let dummy;
    effect(() => {
      dummy = a.value.count
    })
    expect(dummy).toBe(1)
    a.value.count = 2
    expect(dummy).toBe(2)
  })


  it('isRef', () => {
    const a = ref({
      count: 1
    })
    const v = reactive({
      a: 10
    })
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(v)).toBe(false)
  })

  it('unRef', () => {
    const a = ref(10)
    expect(unRef(a)).toBe(10)
    expect(unRef(1)).toBe(1)
  })


  it('proxyRefs', () => {
    const user = {
      age: ref(10),
      name: "小红"
    }
    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    proxyUser.age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)

    proxyUser.age = ref(10)
    expect(proxyUser.age).toBe(10)
  })
})