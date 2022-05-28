import { h, createTextVnode } from "../lib/guide-mini-vue.esm.js"

export const App = {
  render () {
    return h('div', {}, [createTextVnode('我是文本')])
  },
  setup () {
    return {
      msg: "mini vue"
    }
  },
}