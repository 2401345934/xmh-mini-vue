import { h } from "../lib/guide-mini-vue.esm.js"


export const App = {


  setup () {
    return {
      msg: "mini vue"
    }
  },
  render () {
    // ui
    return h("div", {
      title: 'title',
      id: "root",
      style: ['color:red']
    },
      this.msg
      // [
      //   h('p', { class: ['red'] }, "hello p"), h("span", { style: ['color:yellow'] }, 'hello span')
      // ]
    )
  }
}