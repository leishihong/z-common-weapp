import React, { FC, memo, useMemo, useEffect, useState, CSSProperties, useCallback } from 'react';
import { View, Text, Block } from '@tarojs/components';
import Taro, { useReady, usePageScroll } from '@tarojs/taro';
import cls from 'classnames';
import { useSelector } from 'react-redux';
import isFunction from 'lodash/isFunction';
import { TAB } from 'constants/router';
import { NavigationBarProps } from './type';
import cx from './index.module.scss';

const TaroNavigationBar: FC<NavigationBarProps> = (props) => {
  const {
    title,
    background,
    backgroundColorTop,
    back,
    home,
    searchBar,
    searchText,
    iconTheme = 'black',
    extClass,
    isImmersive,
    renderLeft = null,
    renderCenter,
    renderRight,
    delta,
    onBack,
    onHome,
    onSearch,
    onGoTop,
    loading,
    zIndex,
    logo
  } = props;
  const { system } = useSelector(({ globalsState }) => globalsState);
  const [configStyle, setConfigStyle] = useState<any>(() => system);
  const [basicInfo, setBasicInfo] = useState<any>(() => {
    const pages = Taro.getCurrentPages();
    const [currPage] = pages.slice(-1);
    const isHome = currPage.is.includes('circle/index');
    console.log(currPage, 'currPage', pages.length, isHome);
    const showGoHome = home ? home : pages.length == 1 && !isHome;
    console.log(pages, `output->pages`);
    return { isHome, showGoHome, showBack: pages.length > 1 };
  });

  useReady(() => {
    const pages = Taro.getCurrentPages();
    const [currPage] = pages.slice(-1);
    const isHome = currPage.is.includes('circle/index');
    console.log(currPage, 'currPage', pages.length, isHome);
    const showGoHome = home ? home : pages.length == 1 && !isHome;
    // 当页面栈为1的时候关闭返回按钮
    setBasicInfo({ isHome, showGoHome, showBack: pages.length > 1 });
  });

  useEffect(() => {
    console.log(props.color, 'props.color');
    // if (globalSystemInfo.ios) {
    setConfigStyle(setStyle(system));
    // }
  }, [system.ios, basicInfo.showGoHome, basicInfo.showBack, props.color]);

  // usePageScroll(({ scrollTop }) => {
  //   console.log(scrollTop, 'scrollTop---');
  // });

  const handleSearchClick = useCallback(() => {
    isFunction(onSearch) && onSearch();
  }, [onSearch]);
  const handleBackClick = useCallback(
    (event) => {
      event.stopPropagation();
      if (isFunction(onBack)) {
        onBack();
        return;
      }
      const pages = Taro.getCurrentPages();
      if (pages.length >= 2) {
        Taro.navigateBack({
          delta
        });
      }
    },
    [onBack, delta]
  );
  const handleGoHomeClick = useCallback(
    (event) => {
      event.stopPropagation();
      if (isFunction(onHome)) {
        onHome();
        return;
      }
      Taro.switchTab({
        url: TAB['circle']
      });
    },
    [onHome]
  );

  const handleGoTop = useCallback((event) => {
    event.stopPropagation();
    Taro.pageScrollTo({
      scrollTop: 0,
      duration: 400
    });
    onGoTop?.();
  }, []);

  const setStyle = useCallback(
    (systemInfo) => {
      const { showBack, showGoHome } = basicInfo;
      const { statusBarHeight, navBarHeight, capsulePosition, navBarExtendHeight, ios, windowWidth } = systemInfo;
      const { back, home, title, color } = props;
      const rightDistance = windowWidth - capsulePosition.right; //胶囊按钮右侧到屏幕右侧的边距
      const leftWidth = windowWidth - capsulePosition.left; //胶囊按钮左侧到屏幕右侧的边距
      const navigationBarInnerStyle: CSSProperties = {
        color,
        //`background:${background}`,
        height: `${navBarHeight + navBarExtendHeight}px`,
        paddingTop: `${statusBarHeight}px`,
        paddingRight: `${leftWidth}px`,
        paddingBottom: `${navBarExtendHeight}px`
      };
      let navBarLeft: CSSProperties = {};
      if ((showBack && !showGoHome) || (!showBack && showGoHome)) {
        navBarLeft = {
          width: `${capsulePosition.width}px`,
          height: `${capsulePosition.height}px`,
          marginLeft: `0px`,
          marginRight: `${rightDistance}px`
        };
      } else if ((showBack && showGoHome) || title) {
        navBarLeft = {
          width: `${capsulePosition.width}px`,
          height: `${capsulePosition.height}px`,
          marginLeft: `${rightDistance}px`
        };
      } else {
        navBarLeft = { marginLeft: `0px`, width: 'auto' };
      }
      return {
        navigationBarInnerStyle,
        navBarLeft,
        navBarHeight,
        capsulePosition,
        navBarExtendHeight,
        ios,
        rightDistance
      };
    },
    [basicInfo.showBack, basicInfo.showGoHome, props.color]
  );

  const { navigationBarInnerStyle, navBarLeft, navBarHeight, capsulePosition, navBarExtendHeight, ios, rightDistance } =
    configStyle;
  const systemCls = useMemo(() => ({ [cx['ios']]: ios, [cx['android']]: !ios }), []);

  const renderNavLeft = useMemo(() => {
    const { showBack, showGoHome } = basicInfo;
    console.log(showBack, showGoHome, 'renderNavLeft');
    if (renderLeft) return renderLeft;

    if (showBack && !showGoHome) {
      return (
        <View
          className={cls(cx['lzh-nav-bar__button'], cx['lzh-nav-bar__btn_goBack'], cx[`${iconTheme}`])}
          onClick={handleBackClick}
        />
      );
    }
    if (!showBack && showGoHome) {
      return (
        <View
          className={cls(cx['lzh-nav-bar__button'], cx['lzh-nav-bar__btn_goHome'], cx[`${iconTheme}`])}
          onClick={handleGoHomeClick}
        />
      );
    }
    if (showBack && showGoHome) {
      return (
        <View className={cls(cx['lzh-nav-bar__buttons'], systemCls)}>
          <View
            className={cls(cx['lzh-nav-bar__button'], cx['lzh-nav-bar__btn_goBack'], cx[`${iconTheme}`])}
            onClick={handleBackClick}
          />
          <View
            className={cls(cx['lzh-nav-bar__button'], cx['lzh-nav-bar__btn_goHome'], cx[`${iconTheme}`])}
            onClick={handleGoHomeClick}
          />
        </View>
      );
    }
  }, [basicInfo.showBack, basicInfo.showGoHome, back, home, iconTheme, renderLeft, onHome, onBack]);

  const renderNavCenter = useMemo(() => {
    let nav_bar__center: unknown = null;
    if (title) {
      nav_bar__center = <Text>{title}</Text>;
    } else if (searchBar) {
      nav_bar__center = (
        <View
          className={cls(cx['lzh-nav-bar-search'])}
          style={{ height: `${capsulePosition.height}px` }}
          onClick={handleSearchClick}
        >
          <View className={cls(cx['"lzh-nav-bar-search__icon"'])} />
          <View className={cls(cx['lzh-nav-bar-search__input'])}>{searchText}</View>
        </View>
      );
    } else {
      nav_bar__center = renderCenter;
    }
    return (
      <View className={cls(cx['lzh-nav-bar__center'])} style={{ paddingLeft: `${rightDistance}px` }}>
        {loading && <View className={cls(cx['lzh-nav-bar__loading'])}></View>}
        {nav_bar__center}
      </View>
    );
  }, [rightDistance, title, searchBar, searchText, renderCenter, loading]);

  return (
    <Block>
      <View
        className={cls(cx['lzh-nav-bar'], systemCls, extClass)}
        style={{
          background: backgroundColorTop ? backgroundColorTop : background
          // height: `${navBarHeight + navBarExtendHeight}px`,
          // zIndex
        }}
        onClick={handleGoTop}
      >
        {/* {!isImmersive && (
          <View
            className={cls(cx['lzh-nav-bar__placeholder'], systemCls)}
            style={{ paddingTop: `${navBarHeight + navBarExtendHeight}px` }}
          />
        )} */}
        <View
          className={cls(cx['lzh-nav-bar__inner'], systemCls)}
          style={{ background, ...navigationBarInnerStyle, zIndex }}
          onClick={(event) => event.stopPropagation()}
        >
          {logo && <View className={cls(cx['lzh-nav-bar__logo'])}>MYTASTE 热爱光年</View>}
          <View className={cls(cx['lzh-nav-bar__left'])} style={navBarLeft}>
            {renderNavLeft}
          </View>
          {renderNavCenter}
          <View className={cls(cx['lzh-nav-bar__right'])} style={{ marginRight: `${rightDistance}px` }}>
            {renderRight}
          </View>
        </View>
      </View>
      {!isImmersive && <View style={{ height: `${navBarHeight + navBarExtendHeight}px` }} />}
    </Block>
  );
};

TaroNavigationBar.defaultProps = {
  extClass: '',
  background: 'rgba(255,255,255,1)', //导航栏背景
  color: '#333333',
  title: '',
  searchText: '点我搜索',
  searchBar: false,
  back: true,
  home: false,
  iconTheme: 'black',
  delta: 1, // back为true的时候，返回的页面深度
  animated: true, // 显示隐藏的时候opacity动画效果
  isImmersive: false, // 是否沉浸式
  logo: false, // 是否显示logo
  zIndex: '1'
};
export default memo(TaroNavigationBar);
