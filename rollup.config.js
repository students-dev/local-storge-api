/**
 * Rollup Configuration
 * Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi
 * License: MIT
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  },
  {
    input: 'src/main.js',
    output: {
      file: 'dist/index.min.cjs',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      // Add minification plugin if needed, but for simplicity, skip
    ]
  }
];