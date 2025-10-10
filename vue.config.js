const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  configureWebpack: {
    devtool: 'source-map',
    resolve: {
      alias: {
        vue: '@vue/compat'
      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => ({
        ...options,
        compilerOptions: {
          ...(options ? options.compilerOptions : {}),
          compatConfig: {
            MODE: 2
          }
        }
      }));
  }
});
