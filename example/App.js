import { h } from "../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"

window.self = null
export const App = {
  setup () {
    return {
      msg: "mini vue"
    }
  },
  render () {
    self = this
    // ui
    return h("div", {
      title: 'title',
      id: "root",
      style: ['color:red'],
      onClick (e) {
        console.log('click', e);
      }
    },
      // [
      //   h('p', { class: ['red'] }, 'p'), h("span", { style: ['color:yellow'] }, 'hello span')
      // ]
      [h('div', {}, 'hi' + this.msg), h(Foo, {
        onAddFoo (a, b) {
          console.log('我是 app 的 on add', a + b)
        }
      })]
    )
  }
}