// const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
// import TerserPlugin from 'terser-webpack-plugin';
const { resolve } = require('path');
const pkg = require('../package.json');
const pathResolve = (fileName) => resolve(__dirname, '..', fileName);

const config = {
  projectName: pkg.name,
  date: '2023-2-2',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-html'],
  defineConstants: {
    LOCATION_API_KEY: JSON.stringify('NMHBZ-UXHYR-DK3WV-WZFGH-6H67F-M6BFT'),
    // 小程序版本号，手动添加
    WE_APP_VERSION: JSON.stringify('1.0.0'),
    CUSTOM_EMAIL: JSON.stringify('kkdxxh@mytaste.ntesmail.com') // 客服邮箱
  },
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: 'webpack4',
  cache: {
    enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  alias: {
    api: pathResolve('src/api'),
    components: pathResolve('src/components'),
    assets: pathResolve('src/assets'),
    pages: pathResolve('src/pages'),
    utils: pathResolve('src/utils'),
    store: pathResolve('src/store'),
    libs: pathResolve('src/libs'),
    styles: pathResolve('src/styles'),
    hooks: pathResolve('src/hooks'),
    constants: pathResolve('src/constants')
  },
  sass: {
    resource: [
      pathResolve('src/styles/nutui-theme.scss'),
      pathResolve('src/styles/ellipsis.scss'),
      pathResolve('src/styles/hairline.scss')
    ],
    data: `@import "@nutui/nutui-react-taro/dist/styles/variables.scss";`
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: ['nut-']
        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    // esnextModules: ['nutui-react'],
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: ['nut-']
        }
      },
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
