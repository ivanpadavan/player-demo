import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
import * as webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

export default (
  config: webpack.Configuration,
  options: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  require('dotenv').config();
  config.target = ['web', 'es5'];
  if (config.output) {
    config.output.environment = {
      arrowFunction: false,
      const: false,
      destructuring: false,
      forOf: false
    }
  }
  config.plugins?.push(new webpack.EnvironmentPlugin(['LOGIN', 'PASSWORD', 'DEVICE_ID']));
  if (config.optimization) {
    config.optimization.minimize = true;
    if (config.optimization.minimizer) {
      const swc = new TerserPlugin({
        minify: async (input, sourceMap) => {
          const [[filename, code]] = Object.entries(input);
          const result = await require("@swc/core").transform(code, { filename, sourceMaps: true });
          let map;
          if (result.map) {
            map = JSON.parse(result.map);

            // TODO workaround for swc because `filename` is not preset as in `swc` signature as for `terser`
            map.sources = [filename];
            delete map.sourcesContent;
          }
          return {
            code: result.code,
            map
          };
        },
        // `terserOptions` options will be passed to `swc` (`@swc/core`)
        // Link to options - https://swc.rs/docs/config-js-minify
      });
      config.optimization.minimizer.push(swc);
    }
  }
  return config;
};
