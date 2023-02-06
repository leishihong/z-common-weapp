import { FC, memo, useCallback, useState, useMemo, ReactNode } from 'react';
import { View, Block } from '@tarojs/components';
import cls from 'classnames';

import cx from './index.module.scss';

interface IProps {
  title?: string;
  titleDesc?: string | ReactNode;
  children: ReactNode;
  cellGroupCls?: string;
  cellTitleCls?: string;
  extra?: ReactNode;
}

const UCellGroup: FC<IProps> = (props) => {
  const { title, titleDesc, children, cellGroupCls, cellTitleCls, extra } = props;

  const renderTitle = useMemo(() => {
    return (
      (title || titleDesc) && (
        <View className={cx['u-cell-group-wrap']}>
          <View className={cls(cx['u-cell-group-title'], cellTitleCls)}>
            {title}
            {titleDesc && <View className={cx['u-cell-group-title-desc']}>{titleDesc}</View>}
          </View>
          {extra}
        </View>
      )
    );
  }, [title, titleDesc, extra]);

  return (
    <View className={cls(cx['u-cell-group'], cellGroupCls)}>
      {renderTitle}
      {children}
    </View>
  );
};

export default memo(UCellGroup);
