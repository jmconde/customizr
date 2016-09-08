var rollup = require("rollup");
var babel = require("rollup-plugin-babel");

rollup.rollup({
  entry: "./src/app/main.js",
  plugins: [ babel({
      exclude: 'node_modules/**'
    })]
}).then(function (bundle) {
  bundle.write({
    dest: "./dist/bundle.js",
    format: "iife",
    moduleName: "Customizr"
  });
});