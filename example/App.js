import { h } from "../lib/guide-mini-vue.esm.js"


export const App = {


  setup () {
    return {
      msg: "mini vue"
    }

  },
  render () {
    // ui
    return h("div", this.msg)
  }
}