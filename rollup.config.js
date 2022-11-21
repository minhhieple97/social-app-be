import ttypescript from 'ttypescript';
import tsPlugin from 'rollup-plugin-typescript2';

export default {
  input: 'src/lib.ts',
  output: [{ file: 'dist/lib.js', name: 'mylib', format: 'iife', sourcemap: true }],
  plugins: [
    tsPlugin({
      typescript: ttypescript
    })
  ]
};
