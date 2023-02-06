import { fetchVxAppletsLogin, fetchUserLogin, fetchVxAppletsMobile } from 'api/login';
import Taro from '@tarojs/taro';
import logger from 'utils/logger';
import { jumpCallback } from 'utils/utils';
import { TAB } from 'constants/router';

export default {
  namespace: 'loginState',
  state: {
    phoneNumber: '',
    verificationCode: '',
    phoneValid: false,
    codeValid: false
  },
  effects: {
    // 检测自动登录流程
    *checkVxAppletsLogin({}, { put, call, take }) {
      try {
        Taro.showToast({ title: '登录中...', icon: 'loading', mask: true });
        const { code } = yield Taro.login();
        Taro.hideToast();
        const res = yield call(fetchVxAppletsLogin, { code });
        if (res.status === 200 && res.data) {
          yield put({ type: 'handleLogin', payload: res });
          yield take('handleLogin/@@end');
        }
        // if (status === 200) {
        //   // 用户登录过直接信息更新存储
        //   if (data) {
        //     const { token } = data;
        //     yield put({ type: 'globalsState/setAccessToken', payload: { accessToken: token } });
        //     yield put({ type: 'userState/setState', payload: { user: data } });
        //     // 设置storage => 永久保存token
        //     yield Taro.setStorageSync('X_AUTH_TOKEN', token);
        //     yield Taro.setStorageSync('userInfo', data);
        //     // 执行回调
        //     yield jumpCallback();
        //   }
        // }
      } catch (error) {
        Taro.showToast({ title: error?.message, icon: 'none' });
        logger.error(`Logger::loginState:model ->[] *checkVxAppletsLogin[user/vxAppletsLogin] -> e `, {
          error: error
        });
      }
    },
    // 微信手机号码一键登录
    *vxAppletsMobileLogin({ payload: { userPhoneNumberInfo, userProfile } }, { put, call, take }) {
      const { nickName, gender } = userProfile.wxUserInfo;
      const { code: phoneCode } = userPhoneNumberInfo;
      const { code: loginCode } = yield Taro.login();
      try {
        Taro.showToast({ title: '登录中...', icon: 'loading', mask: true });
        const res = yield call(fetchVxAppletsMobile, {
          code: phoneCode,
          loginCode,
          nickName,
          // profilePicture: avatarUrl,
          sex: gender ? 2 : 1 // 后台要求1男2女 小程序获取到0男1女转换一下
        });
        yield put({
          type: 'handleLogin',
          payload: res,
          callback: () => {
            Taro.setStorage({ key: 'wxUserInfo', data: userProfile.wxUserInfo });
          }
        });
        yield take('handleLogin/@@end');
        // if (status === 200) {
        //   const { token } = data;
        //   yield Taro.setStorage({ key: 'wxUserInfo', data: userProfile.wxUserInfo });
        //   //登录成功 存储token
        //   yield put({ type: 'globalsState/setAccessToken', payload: { accessToken: token } });
        //   yield put({ type: 'userState/setState', payload: { user: data } });
        //   // 设置storage => 永久保存token
        //   yield Taro.setStorageSync('X_AUTH_TOKEN', token);
        //   yield Taro.setStorageSync('userInfo', data);

        //   // 执行回调
        //   yield jumpCallback();
        // }
      } catch (error) {
        Taro.showToast({ title: error?.message || '网络异常', icon: 'none' });
        logger.error(`Logger::loginState:model ->[] *vxAppletsMobileLogin[user/vxAppletsMobile] -> e `, {
          error: error
        });
      }
    },
    // 手机验证码登录
    *vxUserLoginRegister({}, { call, put, select, take }) {
      try {
        Taro.showToast({ title: '登录中', icon: 'loading', mask: true });
        const { phoneNumber, verificationCode } = yield select(({ loginState }) => loginState);
        const { status, data } = yield call(fetchUserLogin, { userMobile: phoneNumber, verificationCode });
        if (status === 200) {
          const { token } = data;
          //登录成功 存储token
          yield put({ type: 'globalsState/setAccessToken', payload: { accessToken: token } });
          yield put({ type: 'userState/setState', payload: { user: data } });
          // 设置storage => 永久保存token
          yield Taro.setStorageSync('X_AUTH_TOKEN', token);
          yield Taro.setStorageSync('userInfo', data);
          Taro.switchTab({ url: TAB['circle'] });
        }
      } catch (error) {
        Taro.showToast({ title: error?.message, icon: 'none' });
        logger.error(`Logger::loginState:model ->[] *vxUserLoginRegister[user/registerOrLogin] -> e `, {
          error: error
        });
      }
    },
    *handleLogin({ payload, callback }, { put }) {
      const { status, data } = payload;
      if (status === 200) {
        const { token } = data;
        yield callback?.();
        //登录成功 存储token
        yield put({ type: 'globalsState/setAccessToken', payload: { accessToken: token } });
        yield put({ type: 'userState/setState', payload: { user: data } });
        // 设置storage => 永久保存token
        yield Taro.setStorageSync('X_AUTH_TOKEN', token);
        yield Taro.setStorageSync('userInfo', data);
        console.log(`output->loginState:model -> handleLogin[userInfo]`, data);
        // 执行回调
        yield jumpCallback();
      }
    }
  },
  reducers: {
    setState(state, { payload }) {
      return { ...state, ...payload };
    }
  }
};
