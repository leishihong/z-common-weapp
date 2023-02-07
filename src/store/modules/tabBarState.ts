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
        pagePath: '/pages/home/index',
        iconPath: '/assets/tab-bar/home-icon.png',
        selectedIconPath: '/assets/tab-bar/home-selected-icon.png'
      },
      {
        text: '活动',
        pageName: 'activity',
        pagePath: '/pages/activity/index',
        iconPath: '/assets/tab-bar/home-icon.png',
        selectedIconPath: '/assets/tab-bar/home-selected-icon.png'
      },
      {
        text: '',
        pageName: 'activity',
        pagePath: '/pages/activity/index',
        iconPath: '/assets/tab-bar/home-icon.png',
        selectedIconPath: '/assets/tab-bar/home-selected-icon.png',
        divClass: 'custom-item-view'
      },
      {
        text: '社团',
        pageName: 'community',
        pagePath: '/pages/community/index',
        iconPath: '/assets/tab-bar/home-icon.png',
        selectedIconPath: '/assets/tab-bar/home-selected-icon.png'
      },
      {
        text: '我的',
        pageName: 'mine',
        pagePath: '/pages/mine/index',
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
