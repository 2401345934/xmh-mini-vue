import { h } from "../lib/guide-mini-vue.esm.js"

export const Foo = {
  setup (props) {
    console.log(props)
    props.count++
  },
  render () {
    // ui
    return h("div", {
    },
      'foo :  ' + this.count
    )
  }
}