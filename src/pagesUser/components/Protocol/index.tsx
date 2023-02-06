import React, { memo, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { View, Text, ITouchEvent } from '@tarojs/components';
import cls from 'classnames';
import Taro from '@tarojs/taro';
import { stringify } from 'query-string';
import { Avatar } from '@nutui/nutui-react-taro';
import { formatWebUrl , URL } from 'constants/router';
import { jumpWebview, stringifyQuery } from 'utils/utils';
import cx from './index.module.scss';

const Protocol = forwardRef<any, any>((props, ref) => {
  const {
    checkIcon = 'https://s1.ax1x.com/2022/10/26/xWoUwF.png',
    unCheckedIcon = 'https://s1.ax1x.com/2022/10/26/xWogeO.png',
    onClick,
    protocolText,
    protocolUser
  } = props;
  const [isAgreement, setIsAgreement] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    isAgreement,
    handleAgreement
  }));

  const handleAgreement = useCallback(() => {
    setIsAgreement(!isAgreement);
    onClick?.(!isAgreement);
  }, [isAgreement]);

  const handleClick = useCallback((type: string) => {
    jumpWebview({ url: formatWebUrl(type), isNeedLogin: false });
  }, []);

  return (
    <View className={cx['protocol']}>
      <View onClick={handleAgreement} className={cls(cx['protocol-text'], protocolText)}>
        <Avatar url={isAgreement ? checkIcon : unCheckedIcon} shape='rounded' size={24} />
        &nbsp;登录即表明同意
      </View>
      <View className={cls(cx['protocol-user'], protocolUser)}>
        <Text onClick={() => handleClick('userAgreement')}>《Z时代用户协议》</Text>和
        <Text onClick={() => handleClick('privacyPolicy')}>《隐私政策》</Text>
      </View>
    </View>
  );
});

export default Protocol;
