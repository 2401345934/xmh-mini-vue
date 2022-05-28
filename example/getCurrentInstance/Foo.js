import { h, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js"

export const Foo = {
  name: 'foo',
  setup () {
    const instance = getCurrentInstance()
    console.log(instance, 'foo')
  },
  render () {
    return h('div', {}, '131')
  }
}