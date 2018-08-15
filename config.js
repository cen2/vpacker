module.exports = {
  minimize: true,
  proxy: {
    '/github': 'https://api.github.com'
  },
  proxyServer: process.env.npm_config_proxy || '/github',
  module: process.env.npm_config_module || 'demo'
}
