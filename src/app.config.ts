const tabBarConfig = require('./tabBar.config');

export default defineAppConfig({
  lazyCodeLoading: 'requiredComponents',
  pages: [
    'pages/home-page/index',
    'pages/activity/index',
    'pages/community/index',
    'pages/mine/index',
    // 'pages/land/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black'
  },
  permission: {
    'scope.userLocation': {
      desc: '基于用户地理位置获得附近社团，同城活动推荐'
    }
    // 'scope.useFuzzyLocation': {
    //   desc: '基于用户地理位置获得附近社团，同城活动推荐'
    // }
  },
  tabBar: tabBarConfig,
  subPackages: [
    {
      root: 'pagesUser',
      name: 'pagesUser',
      pages: ['pages/login/index', 'pages/code-login/index', 'pages/system-settings/index']
    }
  ]
});
