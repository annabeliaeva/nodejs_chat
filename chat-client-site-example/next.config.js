const path = require('path')
const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    'rc-util',
    '@ant-design',
    'kitchen-flow-editor',
    '@ant-design/pro-editor',
    'zustand', 'leva', 'antd',
    'rc-pagination',
    'rc-picker'
  ],

  i18n,

  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')],
    prependData: `@import "./src/styles/_mantine.scss"`,
  },

  experimental: {
    swcPlugins: [["next-superjson-plugin", {}]],
  }

}

module.exports = nextConfig
