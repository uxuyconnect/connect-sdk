const path = require("path");
const { context, build } = require("esbuild");
const readFileSync = require('fs').readFileSync;

const isProduction = process.env.NODE_ENV === "production";

// const outDist = path.resolve(__dirname, '../dist');
const tronwebPolyfill = require.resolve('tronweb/dist/TronWeb.js');
const outDist =  isProduction ? path.resolve(__dirname, '../dist') : path.resolve(__dirname, '../example/my-react-app_dev/src/dist');
const entryPoint = path.resolve(__dirname, '../src/index.ts');
const { utils, getPulgins } = require('./utils');


// Define process environment variable
const defineProcessEnv = {
  "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`
};



const basePlugins = [
  {
    name: 'polyfill',
    setup(build) {
      // build.onResolve({ filter: /stream$/ }, (args) => ({
      //   path: streamPolyfill,
      // }));
      // build.onResolve({ filter: /buffer$/ }, (args) => ({
      //   path: bufferolyfil,
      // }));
      build.onResolve({ filter: /tronweb$/ }, (args) => ({
        path: tronwebPolyfill,
      }));
      

      // build.onResolve({ filter: /crypto$/ }, (args) => ({
      //   path: cryptoPolyfill,
      // }));

      // build.onResolve({ filter: /querystring$/ }, (args) => ({
      //   path: querystringPolyfill,
      // }));
    },
  }
]

// SDK base configuration for esbuild
/** @type {import('esbuild').BuildOptions} */
const sdkBaseConfig = {
  metafile: true,
  outbase: outDist,
  // outfile: `${outDist}/index.es.js`,
  entryPoints: [entryPoint],
  define: defineProcessEnv,
  bundle: true,
  target: "es2018", // Set target to ES2018
  tsconfig: "tsconfig.json",
  platform: "browser", // Now properly typed as 'browser'
  minify: isProduction ? true : false,
  sourcemap: isProduction ? true : false,
  resolveExtensions: [".js", ".ts"],

  plugins: isProduction ? basePlugins : [...getPulgins("dev"), ...basePlugins],
};
if(!isProduction){
  sdkBaseConfig.banner = {
    js: readFileSync(
      path.resolve(__dirname, './reload.js'),
      'utf-8'
    ),
  }
}



const builds = [
  {
    ...sdkBaseConfig,
    format: 'iife',
    outfile: `${outDist}/index.iife.js`,
    globalName: 'uxuyTgSdk',
  },
  {
    ...sdkBaseConfig,
    // splitting: true,
    format: 'esm',
    outfile: `${outDist}/index.es.js`
  }

]


  console.log("isProduction----",isProduction)
  // Async function to initialize esbuild context and serve
  ; (async () => {
    try {

      if (!isProduction) {
        const ctxs = await Promise.all(builds.map(context)).catch(() =>
          process.exit(1)
        );
        await Promise.all(ctxs.map((ctx) => ctx.watch()));

        let { port } = await ctxs[0].serve({ servedir: '.', host: '0.0.0.0' });
        const ips = utils.getIPAdress();
        
        console.log(ips.map((ip) => `http://${ip}:${port}/example`).join('\n\r'));
      } else {
        await Promise.all(builds.map(build)).catch(() => process.exit(1));
      }

    } catch (error) {
      console.error("Error starting esbuild:", error);
    }
  })();
