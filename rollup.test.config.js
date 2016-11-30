import globals from './rollup-globals';

export default {
  entry: 'dist/test-root.js',
  dest: 'dist/bundles/test-root.umd.js',
  format: 'umd',
  moduleName: 'storyblok.test',
  globals,
  onwarn: function (message) {
    // Suppress this error message... there are hundreds of them. Angular team says to ignore it.
    // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
    if (/The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten./.test(message)) {
      return;
    }
    console.error(message);
  }
}
