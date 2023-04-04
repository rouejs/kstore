import * as esbuild from "esbuild";
esbuild.build({
  entryPoints: ["./src/index.ts"],
  sourcemap: true,
  // bundle: true,
  format: "cjs",
  target: "es6",
  // splitting: true,
  // minify: true,
  outdir: "./dist",
});
