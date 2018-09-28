const config = require('./config')
const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ip = require('ip')
const portfinder = require('portfinder')
const chalk = require('chalk')

function generatePluginsByMode() {

  switch (process.env.NODE_ENV) {
    case 'development':
      return [
        new webpack.HotModuleReplacementPlugin()
      ]
    case 'production':
      return [
        new CleanWebpackPlugin([`dist/${config.module}/`])
      ]
  }
}

function devServerProxy() {
  let proxy = {}
  let keys = Object.keys(config.proxy)
  keys.forEach(key => {
    proxy[key] = {
      target: config.proxy[key],
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        [`^${key}`]: ''
      }
    }
  })
  return proxy
}

const webpackConfig = {
  mode: process.env.NODE_ENV,
  devtool: process.env.NODE_ENV === 'development' ? 'cheap-module-eval-source-map' : 'source-map',
  devServer: {
    contentBase: path.resolve(__dirname),
    host: ip.address(),
    port: '',
    open: false,
    hot: false,
    overlay: true,
    stats: 'errors-only',
    proxy: devServerProxy()
  },
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.js'
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json']
  },
  entry: {
    [config.module]: `./src/apps/${config.module}/index.js`
  },
  output: {
    filename: `./js/[name].[hash].js`,
    path: path.resolve(__dirname, `dist/${config.module}`)
  },
  plugins: [
    ...generatePluginsByMode(),
    new HtmlWebpackPlugin({
      filename: `./index.html`,
      template: `./src/apps/${config.module}/index.html`
    }),
    new ExtractTextPlugin('./css/[name].[hash].css'),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.SERVER_URL': JSON.stringify(config.proxy[config.proxyServer])
    })
  ],
  optimization: {
    minimize: config.minimize && process.env.NODE_ENV === 'production'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|vue)$/,
        use: 'eslint-loader',
        enforce: 'pre'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(ts|tsx)$/,
        use: ['ts-loader']
      },
      {
        test: /\.(js|jsx)$/,
        use: ['babel-loader']
      },
      {
        test: /\.html$/,
        use: ['html-loader']
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'postcss-loader'
            }
          ],
          publicPath: '../'
        })
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'postcss-loader'
            },
            {
              loader: 'less-loader'
            }
          ],
          publicPath: '../'
        })
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[hash:8].[name].[ext]',
              limit: 3072,
              outputPath: 'images'
            }
          }
        ]
      },
      {
        test: /\.proto$/,
        loader: 'protobuf-loader'
      }
    ]
  }
}

module.exports = new Promise((resolve, reject) => {
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      webpackConfig.devServer.port || (webpackConfig.devServer.port = port)

      console.log(chalk.green('  Build mode : ' + process.env.NODE_ENV + '.\n'))

      console.log(chalk.green('  Build server : ' + config.proxy[config.proxyServer] + '.\n'))

      console.log(chalk.green('  Build module : ' + config.module + '.\n'))

      resolve(webpackConfig)
    }
  })
})
