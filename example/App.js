import { h } from "../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  setup () {
    return {
      msg: "mini vue"
    }
  },
  render () {
    const foo = h(Foo, {}, {
      header: ({ age }) => h('p', {}, 'header' + age),
      footer: () => h('p', {}, 'footer')
    })
    const foo2 = h(Foo, {}, {
      too: () => h('p', {}, 'foo2')
    })
    return h('div', {}, [
      h('div', {}, [foo]),
      h('div', {}, [foo2])
    ])
  }
}