import { h } from "../lib/guide-mini-vue.esm.js"


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

      [
        h('p', { class: ['red'] }, 'p'), h("span", { style: ['color:yellow'] }, 'hello span')
      ]
    )
  }
}