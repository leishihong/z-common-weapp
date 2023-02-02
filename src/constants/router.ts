/**
 * @description 路由地址配置
 */
export const URL: { [key: string]: string } = {
  'system-settings': '/pagesUser/pages/system-settings/index',
  'modify-info': '/pagesUser/pages/modify-info/index',
  login: '/pagesUser/pages/login/index',
  'code-login': '/pagesUser/pages/code-login/index',
  'modify-circle-label': '/pagesUser/pages/modify-circle-label/index',
  'modify-circle-tag-skills': '/pagesUser/pages/modify-circle-tag-skills/index',
  'cropper-image': '/pagesUser/pages/cropper-image/index',
  cancellation: '/pagesUser/pages/cancellation/index',
  'scan-code': '/pagesWriteOff/pages/scan-code-write-off/index',
  'user-home-profile': '/pagesUser/pages/user-home-profile/index',

  'circle-detail': '/pagesCircleGroup/pages/circle-detail/index',
  'community-detail': '/pagesCircleGroup/pages/community-detail/index',
  'blogger-detail': '/pagesCircleGroup/pages/blogger-detail/index',

  'activity-square': '/pagesActivity/pages/activity-square/index',
  'brand-consult': '/pagesActivity/pages/brand-consult/index',
  'activity-detail': '/pagesActivity/pages/activity-detail/index',
  'organize-list': '/pagesActivity/pages/organize-list/index',
  'capsule-activity': '/pagesActivity/pages/capsule-activity/index',

  webview: '/pagesWebview/pages/webview/index',
  404: '/pagesNotfound/pages/404/index',
  land: '/pages/land/index'
};
/**
 * @description TabBar路由
 */
export const TAB = {
  circle: '/pages/circle/index',
  'social-activity': '/pages/social-activity/index',
  follow: '/pages/follow/index',
  blogger: '/pages/blogger/index',
  mine: '/pages/mine/index'
};
/**
 * @description webview 地址处理
 * @param path
 * @returns
 */
export const formatWebUrl = (path: string) => {
  const WE_APP_ENV: any = process.env.WE_APP_ENV;
  const API_URL: any = {
    dev: {
      url: 'https://testweb.mtaste.cn/taste-mobile-test/'
      // url: 'http://192.168.51.96:8078/'
      // url: 'http://192.168.0.108/',
      // url: 'https://192.168.0.101:8078/'
    },
    sandbox: {
      url: 'https://testweb.mtaste.cn/taste-mobile-test/'
    },
    staging: {
      url: 'https://web.mtaste.cn/taste-mobile/'
    },
    prod: {
      url: 'https://web.mtaste.cn/taste-mobile/'
    }
  };
  const url = API_URL[WE_APP_ENV].url;
  return url + path;
};
