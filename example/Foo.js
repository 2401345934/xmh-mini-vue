import { h, renderSlots } from "../lib/guide-mini-vue.esm.js"

export const Foo = {
  setup () {
    return {
    }
  },
  render () {
    const foo = h('p', {}, 'bar')
    const age = 18
    return h('div', {}, [renderSlots(this.$slots, 'header', { age }), foo, renderSlots(this.$slots, 'footer'), renderSlots(this.$slots, 'too')])
  }
}