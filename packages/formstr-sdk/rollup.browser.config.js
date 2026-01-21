import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

export default {
  input: "dist/main.js", // your TypeScript build output
  output: {
    file: "dist/formstr.bundle.js",
    format: "iife", // immediately invoked for browsers
    name: "FormstrSDK", // global variable
    sourcemap: true,
  },
  plugins: [
    resolve({ browser: true }), // resolve npm packages for browser
    commonjs(), // convert CJS dependencies to ESM
    terser(), // optional: minify
  ],
};
