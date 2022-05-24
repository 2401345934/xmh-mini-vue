import pkg from "./package.json"
// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default {
  // 入口
  input: './src/index.ts',
  // 出口
  // 1.cjs -> commjs
  // 2.esm -> esmodule
  output: [
    {
      format: 'cjs',
      file: pkg.main
    },
    {
      format: 'es',
      file: pkg.module
    },
  ],
  // 编译 ts
  plugins: [typescript()]
}