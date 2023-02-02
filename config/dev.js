const WE_APP_ENV = JSON.stringify(process.env.WE_APP_ENV);

module.exports = {
  env: {
    NODE_ENV: '"development"',
    WE_APP_ENV:`${WE_APP_ENV}`,
    // 目的是切换小程序的APPID
    WEAPP_NO: 'weapp-dev',
  },
  defineConstants: {
  },
  mini: {},
  h5: {}
}
