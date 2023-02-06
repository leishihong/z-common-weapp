export default {
  namespace: 'tabBarState',
  state: {
    selectedIndex: 0,
    color: '#333333',
    selectedColor: '#0C0D0D',
    tabList: [
      {
        text: '首页',
        pageName: 'home',
        pagePath: '/tabBar/home/index',
        iconPath: '/assets/tab-bar/home-icon.png',
        selectedIconPath: '/assets/tab-bar/home-selected-icon.png'
      },
      {
        text: '我的',
        pageName: 'mine',
        pagePath: '/tabBar/mine/index',
        iconPath: '/assets/tab-bar/mine-icon.png',
        selectedIconPath: '/assets/tab-bar/mine-selected-icon.png'
      }
    ]
  },
  effects: {},
  reducers: {
    setTabBarIndex(state, { payload }) {
      return { ...state, ...payload };
    }
  }
};
