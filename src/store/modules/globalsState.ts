import Taro from '@tarojs/taro';
import logger from 'utils/logger';
import { getSystemInfo } from 'utils/getSystemInfo';

export default {
  namespace: 'globalsState',
  state: {
    // 登录之后，页面回调信息
    callback: {
      type: '', // 回调类型：tab,webview,page
      url: '', // 回调地址
      query: {}, // 回调参数
      webviewType: ''
    },
    userLocationRes: {},
    reverseGeocoderInfo: {
      address: '',
      location: {
        lat: 0,
        lng: 0
      },
      address_component: { city: '', district: '', nation: '', province: '', street: '', street_number: '' }
    },
    // 用户全局位置
    location: {
      lat: '',
      lng: ''
    },
    // 系统信息
    system: {},
    // 网络状况
    networkInfo: {},
    // 通过定位获取的 address
    address: {},
    // accessToken
    accessToken: Taro.getStorageSync('X_AUTH_TOKEN') ?? '',
    // 唯一id
    sid: '',
    webviewUrl: '',
    storageInfoSync: {},
    accountInfo: {
      miniProgram: {
        appId: '',
        envVersion: 'alpha', //小程序版本 "develop" or "trial" or "release"  开发体验正式
        version: '' // 线上小程序版本号
      },
      plugin: {}
    }
  },
  effects: {
    *getNetworkType({}, { put, select }) {
      const { networkInfo } = yield select(({ globalsState }) => globalsState);
      let payload = { networkInfo };
      try {
        const { networkType } = yield Taro.getNetworkType();
        if (networkType === 'wifi') {
          payload = { networkInfo: { isWiFi: true, isLine: true } };
        } else if (networkType === 'none') {
          payload = { networkInfo: { isWiFi: false, isLine: false } };
        } else {
          payload = { networkInfo: { isWiFi: false, isLine: true } };
        }
        yield put({ type: 'setNetworkInfo', payload });
      } catch (error) {
        yield Taro.showToast({ title: '请检查网络连接是否正常', icon: 'none' });
        yield put({ type: 'setNetworkInfo', payload });
        console.log('error:', error);
        logger.error(`Logger::getNetworkType:model ->[] *Taro.getNetworkType -> 获取网络状况失败 `, { error });
      }
    },
    *getStorageInfo({}, { put }) {
      try {
        const res = yield Taro.getStorageInfoSync();
        yield put({ type: 'setState', payload: { storageInfoSync: res } });
      } catch (error) {
        console.log('error:', error);
        logger.error(`Logger::getStorageInfoSync:model ->[] *Taro.getStorageInfoSync -> 获取存储信息失败 `, { error });
      }
    },
    *getAccountInfoSync({}, { put }) {
      try {
        const res = yield Taro.getAccountInfoSync();
        yield put({ type: 'setState', payload: { accountInfo: res } });
      } catch (error) {
        console.log('error:', error);
        logger.error(`Logger::getAccountInfoSync:model ->[] *Taro.getAccountInfoSync -> 获取当前帐号信息 `, { error });
      }
    },
    *getSystemInfo({}, { call, put }) {
      const globalSystemInfo = yield call(getSystemInfo);
      yield put({ type: 'setSystem', payload: { system: globalSystemInfo } });
    },
    *authLocation({ payload }, { call, put, take }) {
      try {
        const settingRes: Taro.getSetting.SuccessCallbackResult = yield Taro.getSetting();
        const firstAuth = 'scope.userLocation' in settingRes.authSetting;
        console.log(firstAuth, 'firstAuth', settingRes.authSetting);
        // 第一次授权
        if (!firstAuth) {
          const uerLocationRes: Taro.getLocation.SuccessCallbackResult = yield put({ type: 'getUserLocation' });
          yield take('getUserLocation/@@end'); // 直到监听到 getUserLocation 结束才继续执行
          return uerLocationRes;
        }
        // 未授权
        if (!settingRes.authSetting['scope.userLocation']) {
          const modalRes: Taro.showModal.SuccessCallbackResult = yield Taro.showModal({
            title: '操作提示',
            content: '定位权限已拒绝，是否打开',
            cancelText: '取消',
            confirmText: '确定',
            confirmColor: '#F03B56'
          });
          if (modalRes.confirm) {
            // 进入设置类别
            const openSettingRes = yield Taro.openSetting();
            console.log(openSettingRes);
            const uerAuthLocationRes: Taro.getLocation.SuccessCallbackResult = yield put({ type: 'getUserLocation' });
            yield take('getUserLocation/@@end'); // 直到监听到 getUserLocation 结束才继续执行
            return uerAuthLocationRes;
          }
          return {
            errMsg: 'getLocation:fail auth deny'
          };
        }

        return {
          errMsg: 'getLocation:ok'
        };
      } catch (error) {
        console.log('err:', error);
        throw error;
      }
    },
    // 获取用户定位
    *getUserLocation({ payload }: any, { call, put, select }) {
      const { userLocationRes: USER_LOCATION } = select((state) => state.globalsState);
      try {
        // 非实时
        if (!payload?.realTime && USER_LOCATION) {
          return USER_LOCATION;
        }
        const userLocationRes: Taro.getLocation.SuccessCallbackResult = yield Taro.getLocation({ type: 'gcj02' });
        if (userLocationRes?.errMsg.indexOf('ok') !== -1) {
          yield put({
            type: 'setState',
            payload: { userLocationRes, location: { lat: userLocationRes.latitude, lng: userLocationRes.longitude } }
          });
        }
        console.log('userLocationRes:', userLocationRes);
        return userLocationRes;
      } catch (error) {
        throw error;
      }
    }
  },
  reducers: {
    setNetworkInfo(state, { payload }) {
      return { ...state, ...payload };
    },
    setSystem(state, { payload }) {
      return { ...state, ...payload };
    },
    setAccessToken(state, { payload }) {
      return { ...state, ...payload };
    },
    setCallback(state, { payload }) {
      console.log('TCL: setCallback -> callback', payload);
      return { ...state, ...payload };
    },
    setSid(state, { payload }) {
      return { ...state, ...payload };
    },
    setWebviewUrl(state, { payload }) {
      return { ...state, ...payload };
    },
    setState(state, { payload }) {
      return { ...state, ...payload };
    }
  }
};
