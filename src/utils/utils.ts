import Taro from '@tarojs/taro';
import { parse } from 'query-string';
import { URL, TAB } from 'constants/router';
import store from 'store/index';
import logger from 'utils/logger';

// 复制文本
export const copyClipboard = (logisticNo) => {
  Taro.setClipboardData({
    data: logisticNo,
    success: function () {
      Taro.getClipboardData({
        success: function (res) {
          console.log(res.data); // data
        }
      });
    }
  });
};

/**
 * @description 获取当前页url
 */
export const getCurrentPageUrl = (): any => {
  const pages = Taro.getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const url = currentPage.route;
  return url;
};

/**
 * @description 获取url参数;
 * @return {*}
 */
export const getRouterParams = () => {
  const routerParams: any = Taro.getCurrentInstance().router?.params;
  return parse(routerParams);
};

/**
 * TODO: 先满足使用，后期需要完善
 * 根据URL字符串参数，反解析乘对象
 * ?name=Modeest&age=20&sex=1 => {name:'Modeest',age:20,sex:1}
 * @param params
 */
export const parseQuery = (url: string) => parse(url.split('?')[0]);

export const pageToLogin = () => {
  const path = getCurrentPageUrl();
  Taro.clearStorage();
  if (!path.includes('login')) {
    Taro.reLaunch({
      url: '/pages/login/index'
    });
  }
};
/**
 * 动态生成32位uuid
 * 45a94d3b-cf59-6d1b-78db-11e6694410b7
 */
export const uuid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  const result = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  return result;
};
/**
 * @description: 获取设备权限
 * @param {string} scope 需要获取权限的 scope
 * @return: Promise<boolean>
 */
export const getAuthSetting = (scope: string): Promise<boolean> => {
  return new Promise((resolve) => {
    return Taro.authorize({ scope })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};

/**
 * @description: 检测设备权限
 * @param scope 需要获取权限的 scope
 * @returns
 */
export const checkSetting = (scope: string) => {
  return Taro.getSetting()
    .then((res: Taro.getSetting.SuccessCallbackResult) => {
      return Promise.resolve(res.authSetting[scope]);
    })
    .catch((err: TaroGeneral.CallbackResult) => {
      throw Promise.reject(err);
    });
};

/**
 * @description: 保存图片到系统相册
 * @param {string} imgUrl 图片url
 * @return: Promise<boolean>
 */
export const saveImageToPhotosAlbum = (imgUrl: string): Promise<boolean> => {
  return new Promise((resolve, rejecet) => {
    return Taro.saveImageToPhotosAlbum({ filePath: imgUrl })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        rejecet(false);
      });
  });
};

/**
 * 获取storage的数据
 */
export const getStorage = async (key) => {
  try {
    const storage = await Taro.getStorage({ key });
    return storage.data;
  } catch (e) {
    console.log(`storage不存在${key}`);
    return null;
  }
};

/**
 * 小程序跳转webview公参列表
 */
export const webviewCommonQuery = async (query = {}) => {
  const res = await Taro.getNetworkType();
  const cid = await getStorage('cid');
  const { system, version, model, screenWidth, screenHeight, pixelRatio }: any = await Taro.getSystemInfoSync();
  const pixel: any = `${screenWidth * pixelRatio}*${screenHeight * pixelRatio}`;
  const systemRes = {
    model: model, // 手机型号
    osv: system, // 手机系统版本
    version: `${version}|${WE_APP_VERSION}`, // 微信版本号
    pixel // 手机分辨率
  };
  const { globalsState, userState } = store.getState();
  const obj = {
    os: 'weapp', // 区分Android/IOS/小程序
    ...systemRes,
    channel: '', // 渠道名称
    cid: cid || '', // uuid 应用首次初始化随机生成
    deviceId: '', // deviceId
    imei: '', // 国际移动设备识别码
    network: res.networkType || '', // 网络环境
    accountNo: (userState.user && userState.user.accountNo) || '', // 用户ID
    userId: (userState.user && userState.user.id) || '', // 用户ID
    sid: globalsState.sid || '', // sessionId 每次app启动时生成一个uuid值并存储到内存中
    rc_id: '', // 请求ID分配, 参考文档底部说明：api，Android传1，iOS传2
    sign: '' // 签名
  };
  console.log('webviewCommonQuery=> ', obj);
  return JSON.stringify(obj);
};
/**
 * 根据对象，组装URL地址栏的参数
 * {name:'Modeest',age:20,sex:1} => ?name=Modeest&age=20&sex=1
 * @param params
 */
export const stringifyQuery = (params, url = '') => {
  const query: any = [];
  for (const key in params) {
    query.push(`${key}=${encodeURIComponent(params[key])}`);
  }
  console.log(query, 'query');
  if (url.indexOf('?') !== -1) {
    //现有的H5链接好多本身后面都加上了时间戳 有的话再&
    return query.length ? '&' + query.join('&') : '';
  } else {
    console.log('results:->>>', query.length ? '?' + query.join('&') : '');
    return query.length ? '?' + query.join('&') : '';
  }
};

/**
 * URL去重，配合stringifyQuery方法使用
 * @param url
 */
export const getStringifyUrl = (oldUrl) => {
  const arr = oldUrl.split?.('?');
  const url = arr[0];
  const query = arr[1];
  const queryObj = {};
  if (query) {
    const queryArr = query.split('&');
    queryArr.forEach((item) => {
      const tmp = item.split('=');
      queryObj[tmp[0]] = decodeURIComponent(tmp[1]);
    });
  }
  return { url, query: queryObj };
};

/**
 * 功能：跳转到webview页面
 * 注意：默认需要权限，也就是需要 真实token
 */
export const jumpWebview = async ({ url, isNeedLogin = true, query = {}, webviewType = 'navigate' }) => {
  let newUrl = url;
  if (isNeedLogin) {
    const X_AUTH_TOKEN = Taro.getStorageSync('X_AUTH_TOKEN');
    console.log(`output->[jumpWebview]X_AUTH_TOKEN`, X_AUTH_TOKEN);
    const oldUrl = getStringifyUrl(url).url;
    const oldUrlQuery = getStringifyUrl(url).query;
    // 获取小程序公参
    const webviewComQuery = await webviewCommonQuery(query);
    const userInfo = Taro.getStorageSync('userInfo');
    console.log(`output->[jumpWebview]userInfo`, userInfo);
    console.log(oldUrl, oldUrlQuery);
    newUrl =
      oldUrl +
      stringifyQuery(
        {
          userId: userInfo.id || '',
          accountNo: userInfo.accountNo || '',
          ...query,
          ...{ X_AUTH_TOKEN },
          ...oldUrlQuery,
          weappQuery: webviewComQuery
        },
        oldUrl
      );
    console.log(`output->oldUrl`, oldUrl);
    console.log(`output->isNeedLogin=${isNeedLogin}->newUrl`, newUrl);
  }
  console.log(newUrl, 'newUrl----');
  store.dispatch({ type: 'globalsState/setWebviewUrl', payload: { webviewUrl: newUrl } });

  if (webviewType === 'redirect') {
    Taro.redirectTo({ url: URL['webview'] });
  } else {
    Taro.navigateTo({ url: URL['webview'] });
  }
};
export const jumpSetCallback = (callback) => {
  console.log(`output->jumpSetCallback`, callback);
  store.dispatch({
    type: 'globalsState/setCallback',
    payload: { callback }
  });
};
/**
 * 功能：在目标页面操作完成之后，执行回调
 * 注意：该函数是异步函数，别指望等待返回结果
 * @param to
 * @param callback
 */
export const jumpCallback = ({ params = {} } = {}) => {
  let {
    globalsState: {
      callback: { type, url, query, before, webviewType }
    }
  } = store.getState();
  // before: 跳转之前的回调函数，用于修改函数，或者执行其他逻辑
  if (before && typeof before === 'function') {
    before(query);
  }
  switch (type) {
    case 'tab':
      Taro.switchTab({ url: url + stringifyQuery({ ...query, ...params }, url) });
      break;
    case 'page':
      const methods = webviewType === 'redirect' ? 'redirectTo' : 'navigateTo';
      Taro[methods]({
        url: url + stringifyQuery({ ...query, ...params }, url)
      });
      break;
    case 'current':
      Taro.navigateBack({ delta: 1 }); //返回原页面
      break;
    case 'webview':
      query = { ...query, ...params };
      jumpWebview({ url, query, webviewType });
      break;
    default:
      Taro.switchTab({ url: TAB['circle'] });
      break;
  }
  // 处理完回掉清空数据
  if (type !== 'current') {
    store.dispatch({
      type: 'globalsState/setCallback',
      payload: { callback: '' }
    });
  }
};
