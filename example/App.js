
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