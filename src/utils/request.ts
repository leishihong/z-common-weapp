import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosPromise, AxiosError } from 'axios';
import Taro from '@tarojs/taro';
import { stringify } from 'qs';
import store from 'store/index';
import { jumpSetCallback, jumpWebview } from 'utils/utils';
import { TAB, formatWebUrl, URL } from 'constants/router';

// 帮助取消pending中的接口
let cancelToken: any = null;

const settle = (resolve, reject, res, failed = false) => {
  if (!failed) {
    resolve(res);
  } else {
    reject(res);
  }
};

const TaroAdapter = (config): AxiosPromise<any> => {
  return new Promise((resolve, reject) => {
    Taro.request({
      ...config,
      url: config.baseURL + config.url,
      data: config.data,
      method: config.method,
      header: config.headers,
      timeout: config.timeout,
      success: (res: any) => {
        const response = {
          ...res,
          status: res.statusCode,
          statusText: res.errMsg,
          headers: res.header,
          config: config,
          request: null
        };

        settle(resolve, reject, response);
      },
      fail: (res: any) => {
        const response = {
          ...res,
          status: res.statusCode,
          statusText: res.errMsg,
          headers: res.header,
          config: config,
          request: null
        };
        settle(resolve, reject, response, true);
      }
    });
  });
};

export interface Response<T = any> {
  status: number;
  message: string;
  success: boolean;
  data: T;
}

const API_URL: any = {
  dev: {
    url: 'https://testinterface.mtaste.cn' // 测试环境域名
    // url: 'http://39.105.40.245:8806'
    // url: 'http://192.168.51.74:8806' // 大成
    // url: 'http://192.168.50.123:8806', // 洪磊
    // url: 'http://192.168.51.187:8806' // 胡效兴
  },
  sandbox: {
    url: 'http://39.105.40.245:8806'
    // url:'https://testinterface.mtaste.cn'
  },
  staging: {
    url: 'https://testinterface.mtaste.cn'
  },
  prod: {
    // url: 'https://testinterface.mtaste.cn' // 线上暂时用测试环境域名
    url: 'https://interface.mtaste.cn'
  }
};
const WE_APP_ENV: any = process.env.WE_APP_ENV;

console.log(WE_APP_ENV, API_URL[WE_APP_ENV], `API_URL[WE_APP_ENV]`);

const instance: AxiosInstance = axios.create({
  baseURL: `${API_URL[WE_APP_ENV].url}/taste/`,
  timeout: 10000,
  withCredentials: true,
  paramsSerializer: (params) => stringify(params, { arrayFormat: 'comma', skipNulls: true }),
  adapter: TaroAdapter // 添加这一行替换默认的适配器
});
instance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    let X_AUTH_TOKEN = Taro.getStorageSync('X_AUTH_TOKEN') || '';
    config.cancelToken = new axios.CancelToken((c) => (cancelToken = c));
    const token: { [key: string]: string } = X_AUTH_TOKEN ? { Authorization: X_AUTH_TOKEN } : {};
    config.headers = {
      ...config.headers,
      ...token,
      platform: 'H5',
      domain: 'admin_platform'
    };
    console.log(process.env);
    let { networkType } = await Taro.getNetworkType();
    console.log(networkType, 'getNetworkType');
    if (networkType == 'none') {
      Taro.showToast({ title: '网络请求失败，请检查您的网络设置', icon: 'none' });
    }
    return config;
  },
  async (error) => {
    console.log('interceptors->>request', error);
    let { networkType } = await Taro.getNetworkType();
    const title = networkType == 'none' ? '网络请求失败，请检查您的网络设置' : '网络异常，请稍后再试！';
    Taro.showToast({ title, icon: 'none' });
    return Promise.reject(error);
  }
);
// 响应回来后做什么
instance.interceptors.response.use(
  (response: AxiosResponse<Response>) => {
    const { data } = response;
    console.log(response, 'response');
    if (response.status === 200) {
      if ([200].includes(data.status)) {
        return data;
      } else if ([500, 501, 502, 503].includes(data.status)) {
        console.log('网络异常，请稍后再试！', response);
        Taro.showToast({ title: data.message || '网络异常，请稍后再试！', icon: 'none' });
        return data;
        // token失效，则跳转到登录页面 920 用户token过期 910 未知账户 1312001 用户没登录
      } else if ([1312001, 920, 910].includes(data.status)) {
        handleLogout();
        return data;
      } else if (data.status === 921) {
        const specialTreatmentUrl = ['user/vxAppletsMobile', 'user/registerOrLogin', 'user/vxAppletsLogin'];
        if (specialTreatmentUrl.includes((response as any).config.url)) {
          Taro.showModal({
            title: '系统提示',
            content: '该账号已提交注销，注销保护期7天，保护期内该手机号码不可以再次注册',
            showCancel: false,
            confirmText: '随便逛逛',
            success: (res) => {
              if (res.confirm) {
                Taro.switchTab({ url: TAB['circle'] });
              }
            }
          });
          return data;
        }
        // 注销用户访问时 流转注销提示页面
        jumpWebview({
          url: formatWebUrl('cancellationResults'),
          webviewType: 'redirect'
        });
        return data;
      } else {
        Taro.showToast({ title: data.message, icon: 'none' });
        return data;
      }
    } else {
      if (response.status === 401) {
        handleLogout();
        return data;
      } else if ([500, 501, 502, 503].includes(response.status)) {
        Taro.showToast({
          title: '网络异常，请稍后再试！',
          icon: 'none'
        });
        return Promise.reject(data);
      } else {
        Taro.showToast({
          title: response.data.message || '服务器异常，请稍后再试',
          icon: 'none'
        });
        return Promise.reject(data);
      }
    }
  },
  (error) => {
    console.log(error, 'error---');
    if (error.status == undefined) {
      Taro.showToast({
        title: '网络异常，请稍后再试！',
        icon: 'none'
      });
    }
    return Promise.reject(error);
  }
);
export const handleLogout = () => {
  Taro.removeStorageSync('X_AUTH_TOKEN');
  store.dispatch({ type: 'globalsState/setAccessToken', payload: { accessToken: '' } });
  const pages = Taro.getCurrentPages();
  const lastPage = pages[pages.length - 1];
  const lastRoute = '/' + lastPage.route;
  console.log(pages, lastPage, lastRoute, 'handleLogout');
  const tabPages = Object.keys(TAB);
  // ['/pages/circle/index', '/pages/social-activity/index', '/pages/follow/index', '/pages/mine/index'];
  // 获取登录成功跳转的callback
  const webviewPages = [URL['webview']];
  let type = 'page';
  if (tabPages.every((v) => v.search(lastRoute) >= 0)) {
    type = 'tab';
  } else if (webviewPages.every((v) => v.search(lastRoute) >= 0)) {
    type = 'webview';
  }
  jumpSetCallback({ url: lastRoute, type, query: lastPage.options ?? {}, webviewType: 'redirect' });
  // 跳转到登录页面
  Taro.redirectTo({ url: URL['login'] });
};
const post = (url: string, params: any = {}, options: any = {}) => {
  let X_AUTH_TOKEN = Taro.getStorageSync('X_AUTH_TOKEN') || '';
  // const {
  //   userState: { user }
  // } = store.getState();
  const userInfo = Taro.getStorageSync('userInfo');
  const {
    globalsState: { location }
  } = store.getState();
  const userParams = X_AUTH_TOKEN && userInfo ? { userId: userInfo.id, accountNo: userInfo.accountNo } : {};
  const userLocation = location ? { userLatitude: location.lat, userLongitude: location.lng } : {};
  const body = Object.assign({}, { ...userParams, ...userLocation }, params);
  if (options && options.headers && options.headers['Content-Type'] === 'multipart/form-data') {
    return instance.post(url, body, options);
  }
  return instance.post(url, { params: body }, options);
};

// 图片上传
const TaroUploadFile = (filePath, formData: any = {}, uploadUrl: string, fileName: string = 'file') => {
  const X_AUTH_TOKEN = Taro.getStorageSync('X_AUTH_TOKEN');
  const userInfo = Taro.getStorageSync('userInfo');
  const userParams = X_AUTH_TOKEN && userInfo ? { userId: userInfo.id, accountNo: userInfo.accountNo } : {};
  console.log(userParams, filePath, formData, ' Taro.uploadFile', Object.assign({}, formData, userParams));
  return new Promise((resolve, reject) => {
    Taro.showLoading({ title: '上传中' });
    Taro.uploadFile({
      url: `${API_URL[WE_APP_ENV].url}/taste/${uploadUrl}`,
      timeout: 10000,
      filePath: filePath,
      name: fileName,
      header: {
        Authorization: X_AUTH_TOKEN,
        platform: 'H5',
        domain: 'admin_platform',
        'content-type': 'multipart/form-data'
      },
      formData: Object.assign({}, formData, userParams),
      success: (res) => {
        if (res.statusCode === 200) {
          const { status, data, message } = JSON.parse(res.data);
          if (status === 200) {
            resolve(data);
          } else {
            Taro.showToast({ title: message, icon: 'none' });
            reject(message);
          }
        } else {
          reject();
        }
      },
      fail: () => {
        reject();
      }
    });
  });
};

export { cancelToken, post, instance as fetchApi, TaroUploadFile };
