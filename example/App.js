import { h } from "../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  setup () {
    return {
      msg: "mini vue"
    }
  },
  render () {
    const app = h('div', {}, 'App')
    const foo = h(Foo, {}, {
      header: ({ age }) => h('p', {}, 'header' + age),
      footer: () => h('p', {}, 'footer')
    })
    return h('div', {}, [app, foo])
  }
}