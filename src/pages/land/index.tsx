import  React,{ FC, memo, useEffect, useMemo } from 'react';
import { View, Image, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useSelector, useDispatch } from 'react-redux';

import { URL, TAB } from 'constants/router';
import { jumpSetCallback, jumpWebview, stringifyQuery } from 'utils/utils';
import Logo from 'assets/logo.png';

import cx from './index.module.scss';

const LandPage: FC = () => {
  const router = useRouter();
  console.log(router, 'router--lang--');
  const { returnUrl, formType }: any = useMemo(() => router.params, [router]);

  const dispatch = useDispatch();

  const { accessToken: isLogin } = useSelector(({ globalsState }) => globalsState);

  useEffect(() => {
    initLoad();
  }, [formType, router.params]);

  const initLoad = () => {
    let searchParams = { ...router.params };
    console.log(searchParams, 'searchParams', returnUrl, decodeURIComponent(returnUrl));
    delete searchParams.returnUrl;
    delete searchParams.weappQuery;
    switch (formType) {
      case 'h5':
        // 检测地址上是否需要登录
        if (searchParams['needLogin']) {
          // 判断本地用户是否登陆过
          if (isLogin) {
            if (searchParams['refreshToken']) {
              jumpSetCallback({ type: 'webview', url: returnUrl, query: searchParams, webviewType: 'redirect' });
              // Taro.navigateTo({ url: URL['login'] });
              Taro.redirectTo({ url: URL['login'] });
              return;
            }
            jumpWebview({ url: returnUrl + stringifyQuery(searchParams), webviewType: 'redirect' });
            return;
          }
          // 设置回调方便登录以后执行返回
          jumpSetCallback({ type: 'webview', url: returnUrl, query: searchParams, webviewType: 'redirect' });
          // Taro.navigateTo({ url: URL['login'] });
          Taro.redirectTo({ url: URL['login'] });
        }
        jumpWebview({ url: returnUrl + stringifyQuery(searchParams), webviewType: 'redirect' });
        break;
      case 'tab':
        Taro.switchTab({ url: TAB[returnUrl] });
        break;
      case 'page':
        if (searchParams['needLogin']) {
          if (isLogin) {
            Taro.redirectTo({
              url: returnUrl + stringifyQuery(searchParams)
            });
            return;
          }
          jumpSetCallback({
            type: 'page',
            url: returnUrl + stringifyQuery(searchParams),
            query: searchParams,
            webviewType: 'redirect'
          });
          // Taro.navigateTo({ url: URL['login'] });
          Taro.redirectTo({ url: URL['login'] });
        }
        break;
      default:
        Taro.switchTab({ url: TAB['circle'] });
        break;
    }
  };

  return (
    <View className={cx['land-page']}>
      <View className={cx['land-content']}>
        <Image src={Logo} className={cx['land-logo']} />
        <View className={cx['land-title']}>热爱光年</View>
      </View>
    </View>
  );
};

export default memo(LandPage);
