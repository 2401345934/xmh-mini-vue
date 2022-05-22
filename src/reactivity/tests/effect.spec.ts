import { reactive } from "../reactive"
import { effect, stop } from "../effect"
describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    })
    let nextAge;
    effect(() => {
      nextAge = user.age + 1
    });
    expect(nextAge).toBe(11)

    // update
    user.age = 20
    expect(nextAge).toBe(21)

  })

  it("shold return runner when call effect", () => {
    // effect(fn) -> function (runner) => {}

    let foo = 10
    const runner = effect(() => {
      foo++
      return 'foo'
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })

  it('scheduler', () => {

    // 1. 通过 effect 的第二个参数给 一个 scheduler 的fn
    // 2. effect  第一次执行的时候 执行 fn
    // 3. 当响应式对象 set update 不会执行 fn 而是执行 传入的  scheduler
    // 4. 当执行 runnder 的时候 还会再次 执行 scheduler
    // 5. 就是说 如果effect 第二个参数 传入了一个 scheduler 的fn  就不会执行第一个参数 只有 执行 返回的 runner 才会执行 fn
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })



  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop++
    expect(dummy).toBe(2)
    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })



  it('onStop', () => {
    const obj = reactive({
      foo: 1
    })
    const onStop = jest.fn()
    let dummy;
    const runner = effect(() => {
      dummy = obj.foo
    }, {
      onStop
    })
    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })



})
