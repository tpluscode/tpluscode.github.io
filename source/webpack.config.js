/* eslint-disable import/no-extraneous-dependencies */
const path = require('path')
const { merge } = require('webpack-merge')
const { createDefaultConfig } = require('@open-wc/building-webpack')

module.exports = merge(
  createDefaultConfig({
    input: path.resolve(__dirname, './_components/index.html'),
    plugins: {
      indexHTML: false,
      workbox: false
    },
  }),
  {
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, './components'),
      publicPath: '/components/',
    },
    resolve: {
      extensions: ['.ts', '.mjs', '.js', '.json'],
      alias: {
        stream: 'readable-stream',
      },
    },
    node: {
      crypto: true,
    },
  },
)
