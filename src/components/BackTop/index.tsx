import { FC, memo, useMemo, CSSProperties, useCallback, useState, useRef, ReactNode } from 'react';
import { View, Image } from '@tarojs/components';
import Taro, { usePageScroll, PageScrollObject } from '@tarojs/taro';
import cls from 'classnames';
import throttle from 'lodash/throttle';
import BackTopIcon from 'assets/back-top-icon.png';
import cx from './index.module.scss';

interface IBackTopProps {
  visible?: boolean;
  backIcon?: string | any;
  duration?: number | any;
  distance?: number | any;
  style?: CSSProperties;
  zIndex?: number | any;
  bottom?: number | any;
  right?: number | any;
  isAnimation?: boolean;
  onBackTop?: (event: MouseEvent) => void;
}
const defaultProps = {
  isAnimation: true,
  duration: 1000,
  distance: 200,
  bottom: 20,
  right: 32,
  backIcon: BackTopIcon,
  zIndex: 10,
  visible: false
} as IBackTopProps;

const BackTop: FC<IBackTopProps> = (props) => {
  const { onBackTop, style, backIcon, isAnimation, duration, distance, zIndex, bottom, right, visible } = props;
  const [showBackTop, setShowBackTop] = useState<boolean>(visible || false);

  usePageScroll(
    throttle((payload: PageScrollObject) => {
      const { scrollTop } = payload;
      scrollTop >= distance ? setShowBackTop(true) : setShowBackTop(false);
      // if (!showBackTopRef.current && scrollTop > 180) {
      //   showBackTopRef.current = true;
      //   setShowBackTop(true);
      // }
      // if (showBackTopRef.current && scrollTop < 170) {
      //   showBackTopRef.current = false;
      //   setShowBackTop(false);
      // }
    }, 200)
  );

  const handleClick = useCallback((event) => {
    onBackTop?.(event);
    Taro.pageScrollTo({
      scrollTop: 0, // 滚动到页面的目标位置，单位 px
      duration: isAnimation && duration > 0 ? duration : 0, // 滚动动画的时长，单位 ms
      selector: 'scroll' // 选择器, css selector (rn 不支持该属性)
    });
  }, []);

  const backTopStyle = {
    right: `${right}px`,
    bottom: `${bottom}px`,
    zIndex
  };

  const renderBackTop = useMemo(() => {
    return (
      <View
        className={cls(cx.backTopWrap, {
          [cx.show]: showBackTop
        })}
        style={Object.assign({}, backTopStyle, style)}
        onClick={handleClick}
      >
        <Image src={backIcon} mode='aspectFill' />
      </View>
    );
  }, [showBackTop, backIcon, style]);

  return renderBackTop;
};
BackTop.defaultProps = defaultProps;
BackTop.displayName = 'UBackTop';

export default memo(BackTop);
