import React, { FC, memo, useMemo, useEffect, useRef, useCallback, Fragment } from 'react';
import Taro, { switchTab, getSystemInfoSync } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { useSelector, useDispatch } from 'react-redux';
import cls from 'classnames';
import { getSystemInfo } from 'utils/getSystemInfo';
import { TAB } from 'constants/router';

import cx from './index.module.scss';

const CustomTabBar: FC = () => {
  const { tabList, color, selectedColor, selectedIndex = 0 } = useSelector(({ tabBarState }) => tabBarState);
  const dispatch = useDispatch();
  const query = Taro.createSelectorQuery();
  // const sys: any = useRef(getSystemInfoSync()).current;
  // console.log(sys, 'sys');
  // const insets = useRef({
  //   top: sys.safeArea.top,
  //   bottom: sys.safeArea.bottom - sys.safeArea.height,
  //   left: sys.safeArea.left,
  //   right: sys.safeArea.right
  // }).current;
  // let size = { width: sys.screenWidth, height: sys.screenHeight };

  const onSwitchTab = useCallback(
    (item, index: number) => {
      switchTab({
        url: TAB[item.pageName],
        success: () => {
          dispatch({ type: 'tabBarState/setTabBarIndex', payload: { selectedIndex: index } });
        }
      });
    },
    [dispatch, switchTab]
  );

  const renderTabBar = useMemo(() => {
    return (
      <View className={cls(cx['tab-bar'], 'tabBarRect')}>
        <View id='tab-bar-wrap' className={cx['tab-bar-wrap']}>
          {tabList.map((item, index) => {
            return (
              <View
                className={cx['tab-bar-item']}
                onClick={() => onSwitchTab(item, index)}
                data-path={item.pagePath}
                key={item.pagePath}
              >
                <Image
                  className={cx['tab-bar-item-icon']}
                  src={selectedIndex === index ? item.selectedIconPath : item.iconPath}
                />
                <View
                  className={cx['tab-bar-item-title']}
                  style={{
                    color: selectedIndex === index ? selectedColor : color
                  }}
                >
                  {item.text}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }, [selectedIndex]);

  return renderTabBar;
};

export default memo(CustomTabBar);
