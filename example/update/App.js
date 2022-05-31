import { h, ref } from "../../lib/guide-mini-vue.esm.js"

export const App = {
  setup () {

    let count = ref(0);
    const addCount = () => {
      console.log(100)
      count.value++
    }
    return {
      count,
      addCount
    }
  },
  render () {
    return h('div',
      {
        id: "root"
      },
      [
        h('button',
          {
            onClick: this.addCount
          }, 'click'),
        h('p',
          {},
          'message :   ' + this.count
        )
      ]
    )
  }
}