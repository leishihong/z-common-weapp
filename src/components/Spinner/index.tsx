import { FC, memo } from 'react';
import { View } from '@tarojs/components';

import cx from './index.module.scss';

const Spinner: FC = () => {
  return (
    <View className={cx.spinnerContainer}>
      <View className={cx.spinnerLoading}>
        <View className='rect rect1'></View>
        <View className='rect rect2'></View>
        <View className='rect rect3'></View>
        <View className='rect rect4'></View>
        <View className='rect rect5'></View>
      </View>
      <View className={cx.spinnerLoadingText}>正在加载中......</View>
    </View>
  );
};

export default memo(Spinner);
