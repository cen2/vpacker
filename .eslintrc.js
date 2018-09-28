module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: ['plugin:react/recommended', 'plugin:vue/essential'],
  plugins: ['react', 'vue'],
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', // 生产环境禁止debugger
    'no-var': 'error', // 禁止使用var
    'semi': ['warn', 'never'], // 建议语句结尾不写分号
    "vue/no-parsing-error": [2, { "x-invalid-end-tag": false }]
  }
}
