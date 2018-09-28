module.exports = {
  minimize: true,
  proxy: {
    '/test': 'wss://test.wss.app.91vv.com'
  },
  proxyServer: process.env.npm_config_proxy || '/test',
  module: process.env.npm_config_module || ''
}
