const tabBarConfig = require('./tabBar.config');

export default defineAppConfig({
  lazyCodeLoading: 'requiredComponents',
  pages: ['tabBar/index/index'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  permission: {
    // 'scope.userLocation': {
    //   desc: '基于用户地理位置获得附近社团，同城活动推荐'
    // }
    // 'scope.useFuzzyLocation': {
    //   desc: '基于用户地理位置获得附近社团，同城活动推荐'
    // }
  },
  tabBar: tabBarConfig
});
