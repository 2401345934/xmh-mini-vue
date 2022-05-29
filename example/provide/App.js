import { h, provide, inject, createTextVnode } from "../../lib/guide-mini-vue.esm.js"



export const App = {
  name: 'App',
  setup () {
    provide('a', '1')
    provide('b', '10')
  },
  render () {
    return h('div', {}, [h('p', {}, 'app'), h(Parent)])
  },
}

export const Parent = {
  name: 'Parent',
  setup () {
  },
  render () {
    return h('div', {}, [h('p', {}, 'parent'), h(Children)])
  },
}


export const Children = {
  name: 'Children',
  setup () {
    provide('a', '10')
  },
  render () {
    return h('div', {}, [h('p', {}, 'Children'), h(Children2)])
  },
}


export const Children2 = {
  name: 'Children2',
  setup () {
    provide('a', '20')
    const a = inject('a')
    const b = inject('b')
    const c = inject('c', 30)
    return {
      a, b, c
    }
  },
  render () {
    return h('p', {}, `a --- ${this.a}  b -----${this.b}  c -----${this.c}`)
  },
}