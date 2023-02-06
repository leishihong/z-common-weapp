import { FC, memo, CSSProperties, useCallback, ReactNode } from 'react';
import { View, Text, Image } from '@tarojs/components';
import cls from 'classnames';
import ArrowRightIcon from 'assets/arrow-right-cell-icon.png';
import cx from './index.module.scss';

interface IProps {
  title?: string | unknown;
  label?: string;
  rightIcon?: any;
  bordered?: boolean;
  centered?: boolean;
  cellCls?: string;
  cellStyle?: CSSProperties;
  titleCls?: string;
  value?: any;
  valueCls?: string;
  renderIcon?: string;
  placeholder?: string;
  onClickPress?: (event) => void;
  onClickable?: () => void;
  onClickRight?: () => void;
  children?: ReactNode;
}

const UCell: FC<IProps> = (props) => {
  const {
    bordered,
    centered,
    cellCls,
    cellStyle,
    value,
    valueCls,
    placeholder,
    titleCls,
    title,
    rightIcon,
    renderIcon,
    onClickPress,
    onClickable,
    onClickRight,
    children
  } = props;

  const handleClickPress = useCallback(() => {
    onClickable?.();
  }, []);

  const handleRightIcon = useCallback((event) => {
    event.stopPropagation();
    onClickRight?.();
  }, []);

  return (
    <View
      className={cls(
        cx['u-cell'],
        {
          [cx[`u-cell--borderLess`]]: !bordered,
          [cx[`u-cell--centered`]]: centered
        },
        cellCls
      )}
      style={cellStyle}
      onClick={onClickPress}
    >
      {/* 左侧区域 */}
      <View className={cls([cx['u-cell__left']])}>
        {renderIcon && (
          <View className={cls(cx['u-cell__left-wrap'])}>
            <View className={cls(cx['u-cell__left-icon'])}>{renderIcon}</View>
          </View>
        )}
        <View className={cls(cx['u-cell__left-title'], titleCls)}>{title}</View>
      </View>
      {/* 右侧内容区域 */}
      <View
        className={cls(
          cx['u-cell__value'],
          {
            [cx[`u-cell__value-placeholder`]]: children ? false : !value
          },
          valueCls
        )}
        onClick={handleClickPress}
      >
        {children ? children : (value || placeholder) && <Text>{value || placeholder}</Text>}
      </View>
      {/* 右侧按钮 */}
      <View className={cls([cx['u-cell__right']])} onClick={handleRightIcon}>
        {rightIcon && (
          <View className={cls(cx['u-cell__right-wrap'])}>
            <Image src={rightIcon} mode='aspectFill' className={cx['u-cell__right-icon']} />
          </View>
        )}
      </View>
    </View>
  );
};

UCell.defaultProps = {
  bordered: true,
  centered: false,
  rightIcon: ArrowRightIcon
};

export default memo(UCell);
