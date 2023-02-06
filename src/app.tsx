import React, { FC, PropsWithChildren, useEffect, useMemo } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Provider } from 'react-redux';

import store from 'store/index';
import { handleUpdate } from 'utils/taroUpdateManager';
import { getSystemInfo } from 'utils/getSystemInfo';
import { inWeApp } from 'utils/base';

import './app.scss';

const App: FC<PropsWithChildren> = ({ children }) => {
  const { tabBarState, globalsState } = store.getState();
  const dispatch = store.dispatch;
  const page = useMemo(() => Taro.getCurrentInstance().page, []);

  useDidShow(() => {
    if (inWeApp) {
      const tabBar = Taro.getTabBar<any>(page);
      tabBar?.setSelected(tabBarState.selectedIndex);
    }
    dispatch({ type: 'tabBarState/setTabBarIndex', payload: { selectedIndex: tabBarState.selectedIndex } });
    handleUpdate();
  });
  Taro.onPageNotFound((options) => {
    console.log('on page not found', options);
    Taro.redirectTo({
      url: URL['404']
    });
  });
  useEffect(() => {
    dispatch({ type: 'globalsState/getAccountInfoSync' });
    dispatch({ type: 'globalsState/setSystem', payload: { system: getSystemInfo() } });
    dispatch({ type: 'globalsState/getStorageInfo' });
    dispatch({ type: 'globalsState/getNetworkType' });
    Taro.onNetworkStatusChange((res) => {
      console.log(Boolean(res.isConnected), 'Boolean(res.isConnected)');
      dispatch({ type: 'globalsState/getNetworkType' });
    });
  }, []);

  return <Provider store={store}>{children}</Provider>;
};

export default App;
