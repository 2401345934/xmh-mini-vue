import { h, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  name: 'app',
  setup () {
    const instance = getCurrentInstance()
    console.log(instance, 'app')
  },
  render () {
    return h(Foo, {}, [])
  },
}