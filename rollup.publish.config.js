import globals from './rollup-globals';

export default {
  entry: 'dist/index.js',
  dest: 'dist/bundles/storyblok.umd.js',
  format: 'umd',
  moduleName: 'storyblok',
  globals
}