import { useState, useEffect, useLayoutEffect, FC, memo, useMemo, useCallback, lazy, Suspense, useRef } from 'react';
import { View, Button, Text, Block, Video, MovableArea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useSelector, useDispatch } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import cls from 'classnames';
import { TAB, URL, formatWebUrl } from 'constants/router';
import { Avatar, TaroNavigationBar } from 'components/index';
import { getStorage, jumpWebview } from 'utils/utils';
import Protocol from '../../components/Protocol';

import cx from './index.module.scss';

const Popup = lazy(() => import('components/Popup'));

const Login: FC<any> = () => {
  const router = useRouter();
  const { user } = useSelector(({ userState }) => userState);
  const dispatch = useDispatch();
  const page: any = useMemo(() => Taro.getCurrentInstance().page, []);
  const protocolRef = useRef<any>();
  const [phoneNumberInfo, setPhoneNumberInfo] = useState(Object);
  const [canGetUserInfo, setCanGetUserInfo] = useState<boolean>(false);
  const [isAgreement, setIsAgreement] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<Object>();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useLayoutEffect(() => {
    initWxUserInfo();
  }, []);
  //TODO:验证是否登录,进行自动登录的操作
  useEffect(() => {
    // Taro.checkSession({
    //   success(res) {
    //     const errMsg = res.errMsg === 'checkSession:ok';
    //     const X_AUTH_TOKEN = Taro.getStorageSync('X_AUTH_TOKEN');
    //     console.log(X_AUTH_TOKEN, 'openid----');
    //     // 注销自动登录
    //     if (errMsg && !isEmpty(user)) {
    //       dispatch({ type: 'loginState/checkVxAppletsLogin' });
    //     }
    //   }
    // });
  }, []);
  const initWxUserInfo = async () => {
    const wxUserInfo = (await getStorage('wxUserInfo')) ?? {};
    setUserProfile((preState) => Object.assign({}, preState, { wxUserInfo }));
    setCanGetUserInfo(!isEmpty(wxUserInfo));
  };

  /**
   * @description 获取用户头型昵称、性别
   * @function getUserProfile
   * @subDescription 已经授权过不需要再次弹窗
   * @returns
   */
  const handleGetUserProfile = () => {
    if (!protocolRef.current?.isAgreement) {
      Taro.showToast({ title: '请阅读并勾选底部协议', icon: 'none' });
      return;
    }
    Taro.getUserProfile({
      desc: '获取你的昵称、头像、地区及性别',
      success: (res) => {
        const { userInfo: wxUserInfo, encryptedData, iv, signature } = res;
        console.log(wxUserInfo, 'wxUserInfo', res);
        setUserProfile({ wxUserInfo, encryptedData, iv, signature });
        setCanGetUserInfo(true);
      },
      fail: (error) => {
        console.log(error, 'weee');
        handleGoHome();
      }
    });
  };
  /**
   * @description 获取手机号码
   * @function getUserInfo
   * @function GetPhoneNumber
   * 1. 根据手机号码获取加密数据，并获取用户信息
   * 2. 将用户信息存储到redux中
   */
  const handleGetPhoneNumber = async ({ detail }) => {
    console.log(detail, '------detail------');
    const errMsg = detail.errMsg;
    if (errMsg === 'getPhoneNumber:ok') {
      if (detail.iv && detail.encryptedData) {
        setPhoneNumberInfo({
          iv: detail.iv,
          encryptedData: detail.encryptedData
        });
        dispatch({ type: 'loginState/vxAppletsMobileLogin', payload: { userPhoneNumberInfo: detail, userProfile } });
      }
    } else {
      Taro.showModal({
        title: '授权失败',
        content: '您已拒绝获取手机号登录授权，可使用其他手机号验证登录',
        cancelText: '知道了',
        confirmText: '验证登录',
        cancelColor: '#333333',
        confirmColor: '#FD2A53',
        success: (res) => {
          if (res.confirm) {
            handleGoPhoneLogin();
          }
        }
      });
    }
  };

  const reLaunch = () => {
    const from_url = router.params.returnPage;
    if (from_url && from_url !== undefined) {
      Taro.reLaunch({ url: from_url });
    } else {
      Taro.switchTab({ url: TAB['circle'] });
    }
  };
  const handleGoPhoneLogin = () => {
    Taro.navigateTo({ url: URL['code-login'] });
  };
  const handleGoHome = useCallback(() => {
    if (page.length > 0) {
      Taro.navigateBack({ delta: -1 });
    } else {
      Taro.switchTab({ url: TAB['circle'] });
    }
  }, [page]);

  const handleConfirm = useCallback(() => {
    protocolRef.current?.handleAgreement();
    setIsVisible(false);
  }, []);

  const handleAgreementClick = useCallback((type: string) => {
    jumpWebview({ url: formatWebUrl(type), isNeedLogin: false });
  }, []);

  return (
    <Block>
      <TaroNavigationBar back home isImmersive background='transparent' />
      <MovableArea style='width:100%;'>
        <Video
          src='https://img.mtaste.cn/prod/video/system/config/4cbe5686-2eb5-4348-9c33-28ec7490f86b.mp4'
          poster='https://img.mtaste.cn/prod/video/system/config/53923894-b19b-43b7-b55d-9f6dc7c99b19.jpg'
          autoplay
          muted
          loop
          objectFit='cover'
          initialTime={0}
          enableProgressGesture={false}
          showPlayBtn={false}
          showProgress={false}
          showFullscreenBtn={false}
          showCenterPlayBtn={false}
          style='height:100vh;width:100%;'
        ></Video>
      </MovableArea>
      <View className={cx['z-login-page']}>
        <View className={cls(cx['login-content'], 'safe-area-inset-bottom')}>
          <View className={cx['login-body']}>
            {/* <Button
              className={cx['login-btn']}
              openType={isAgreement ? 'getPhoneNumber' : undefined}
              onGetPhoneNumber={handleGetPhoneNumber}
              onClick={() => {
                if (!isAgreement) {
                  setIsVisible(true);
                }
              }}
            >
              授权手机号
            </Button> */}
            {canGetUserInfo ? (
              <Button
                className={cx['login-btn']}
                openType={isAgreement ? 'getPhoneNumber' : undefined}
                onGetPhoneNumber={handleGetPhoneNumber}
                onClick={() => {
                  if (!isAgreement) {
                    setIsVisible(true);
                  }
                }}
              >
                授权手机号
              </Button>
            ) : (
              <Button className={cx['login-btn']} onClick={handleGetUserProfile}>
                微信快捷登录
              </Button>
            )}
            <View className={cx['login-btn-other']} onClick={handleGoHome}>
              在逛逛
            </View>
          </View>
          <View className={cx['login-other']}>
            <Text className={cx['login-other-text']}>其他手机号登录</Text>
            <Avatar
              src='https://s1.ax1x.com/2022/12/23/zja9E9.png'
              rootCls={cx['login-other-icon']}
              shape='rounded'
              onAvatar={handleGoPhoneLogin}
              size={76}
            />
          </View>
          <Protocol ref={(ref) => (protocolRef.current = ref)} onClick={(e) => setIsAgreement(e)} />
        </View>
        <Suspense fallback={null}>
          <Popup
            visible={isVisible}
            rounded
            wrapCls={cx['popup-wrap']}
            title={<View className={cx['popup-title']}>服务协议及隐私保护</View>}
            onCancel={() => setIsVisible(false)}
            footer={
              <View className={cx['footer']}>
                <Button
                  className={cls(cx['footer-btn'], cx['footer-agree'])}
                  openType='getPhoneNumber'
                  onClick={handleConfirm}
                  onGetPhoneNumber={handleGetPhoneNumber}
                >
                  同意并登录
                </Button>
                <Text className={cls(cx['footer-btn'], cx['footer-refused'])} onClick={() => setIsVisible(false)}>
                  不同意
                </Text>
              </View>
            }
          >
            <View className={cx['popup-content']}>
              为了更好的保障您的合法权益，请阅读并同意以下协议
              <View className={cx['popup-agreement']} onClick={() => handleAgreementClick('userAgreement')}>
                《Z时代用户协议》
              </View>
              <View className={cx['popup-agreement']} onClick={() => handleAgreementClick('privacyPolicy')}>
                《隐私政策》
              </View>
            </View>
          </Popup>
        </Suspense>
      </View>
    </Block>
  );
};
export default memo(Login);
