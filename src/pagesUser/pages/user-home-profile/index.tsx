import { useState, useEffect, useMemo, FC, Fragment, useCallback } from 'react';
import { View, Block } from '@tarojs/components';
import Taro, { useDidShow, usePageScroll, useRouter, useShareAppMessage, ShareAppMessageObject } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, TaroNavigationBar, EmptyPage } from 'components/index';
import { URL, TAB } from 'constants/router';
import { shareAppMessage } from 'utils/shareAppMessage';

import { jumpSetCallback } from 'utils/utils';

import MineUserInfo from './components/MineUserInfo';
import CircleIdCard from './components/CircleIdCard';

import cx from './index.module.scss';

const UserHomeProfile: FC = () => {
  const dispatch = useDispatch();
  const { userHomeProfileState, globalsState } = useSelector(({ globalsState, userHomeProfileState }) => ({
    globalsState,
    userHomeProfileState
  }));
  const router = useRouter();
  const { userId, accountNo } = useMemo(() => router.params, [router.params]);
  const {
    system: { navBarHeight, navBarExtendHeight }
  } = useMemo(() => globalsState, [globalsState]);
  const { nickName, coverImg, initLoading, isNetwork } = useMemo(() => userHomeProfileState, [userHomeProfileState]);
  const [navBarInfo, setNavBarInfo] = useState<any>({
    isImmersive: true,
    background: `linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)`
  });
  const accessToken = Taro.getStorageSync('X_AUTH_TOKEN');

  useDidShow(() => {
    if (accessToken) {
      dispatch({ type: 'userHomeProfileState/queryUserHomeProfile', payload: { userId, accountNo } });
    } else {
      jumpSetCallback({
        url: URL['user-home-info'],
        type: 'page',
        query: { ...router.params },
        webviewType: 'redirect'
      });
      Taro.redirectTo({ url: URL['login'] });
    }
    // setTabBar(3);
  });

  usePageScroll(({ scrollTop }) => {
    const navOp = scrollTop / (navBarHeight + navBarExtendHeight);
    setNavBarInfo((preState) =>
      Object.assign({}, preState, {
        background:
          scrollTop > 10
            ? `rgba(255, 255, 255, ${navOp > 1 ? 1 : navOp})`
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)',
        title: scrollTop > 10 ? nickName : ''
      })
    );
  });

  // useShareAppMessage((payload: ShareAppMessageObject) => {
  //   console.log(payload, 'payload');
  //   return shareAppMessage();
  // });

  if (initLoading) return <Block />;

  if (isNetwork)
    return (
      <View className='page-empty-content safe-area-inset-bottom'>
        <EmptyPage
          showButton
          onReload={() => {
            dispatch({ type: 'userHomeProfileState/setState', payload: { initLoading: true, isNetwork: false } });
            dispatch({ type: 'userHomeProfileState/queryUserHomeProfile' });
          }}
        />
      </View>
    );

  return (
    <Block>
      <TaroNavigationBar {...navBarInfo} home zIndex='2032' />
      <View
        className={cx['mine-page']}
        style={{ backgroundImage: `url(${coverImg ? coverImg : 'https://s1.ax1x.com/2022/10/27/xhZIzj.png'})` }}
      >
        <MineUserInfo />
        <CircleIdCard />
      </View>
    </Block>
  );
};
export default UserHomeProfile;
