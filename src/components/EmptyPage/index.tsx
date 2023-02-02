import React, { FC, memo, useMemo, ReactNode, CSSProperties, useCallback } from 'react';
import { View, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import cls from 'classnames';
import map from 'lodash/map';
import cx from './index.module.scss';

interface IEmptyBtn {
  btnCls?: string | 'primary' | 'cancel';
  type?: string;
  onClick?: () => void;
  text?: string;
}
interface IProps {
  emptyText?: string;
  emptyIcon?: string;
  rootCls?: string;
  style?: CSSProperties;
  showButton?: boolean;
  iconCls?: string;
  iconStyle?: CSSProperties;
  textCls?: string;
  textStyle?: CSSProperties;
  emptyBtnText?: string;
  showBackBtn?: boolean;
  emptyBtn?: ReactNode | Array<IEmptyBtn>;
  onReload?: () => void;
}

const EmptyPage: FC<IProps> = (props) => {
  const {
    emptyIcon = 'https://img.mtaste.cn/prod/img/system/config/4a075eb36b8847b1893c3214f93acdd8.png',
    emptyText = '网络突然开小差',
    showButton = false,
    showBackBtn = false,
    style,
    iconCls,
    iconStyle,
    textCls,
    textStyle,
    emptyBtnText = '刷新页面',
    emptyBtn,
    onReload
  } = props;
  // 判断是否有上一页，有的话显示返回上一页按钮，没有就只展示刷新
  const pages = useMemo(() => Taro.getCurrentPages(), []);

  const renderEmptyBtn = useMemo(() => {
    return Array.isArray(emptyBtn) ? (
      <View className={cx.btnGroups}>
        {map(emptyBtn, (item, index) => (
          <View key={index} className={cls(cx.btn, cx[`btn__${item.type}`], item.btnCls)} onClick={item.onClick}>
            {item.text}
          </View>
        ))}
      </View>
    ) : (
      emptyBtn
    );
  }, [emptyBtn]);

  const handelRefresh = useCallback(() => {
    onReload?.();
  }, [onReload, showButton]);
  const handleBack = useCallback(() => {
    Taro.navigateBack();
  }, []);

  return (
    <View className={cls(cx.emptyPage)} style={style}>
      <View className={cls(cx.emptyPageIcon, iconCls)} style={iconStyle}>
        <Image src={emptyIcon} mode='aspectFill' />
      </View>
      <View className={cls(cx.emptyPageText, textCls)} style={textStyle}>
        {emptyText}
      </View>
      {renderEmptyBtn}
      {showButton && (
        <View className={cx['empty-footer-btn']}>
          <View className={cls(cx.emptyBtnText)} onClick={handelRefresh}>
            {emptyBtnText}
          </View>
          {pages.length > 1 && showBackBtn && (
            <View className={cx['emptyBack']} onClick={handleBack}>
              返回上一页
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default memo(EmptyPage);
