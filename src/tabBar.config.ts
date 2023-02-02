const tabBarConfig = {
  custom: true,
  color: '#333333',
  selectedColor: '#0C0D0D',
  backgroundColor: '#fff',
  list: [
    {
      text: '首页',
      pagePath: 'pages/home/index',
      iconPath: 'assets/tab-bar/home-icon.png',
      selectedIconPath: 'assets/tab-bar/home-selected-icon.png'
    },
    {
      text: '我的',
      pagePath: 'pages/mine/index',
      iconPath: 'assets/tab-bar/mine-icon.png',
      selectedIconPath: 'assets/tab-bar/mine-selected-icon.png'
    }
  ]
};

module.exports = tabBarConfig;
