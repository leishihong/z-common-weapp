import  React,{ useState, useEffect, FC, memo, useMemo, useCallback, useLayoutEffect, useRef } from 'react';
import { View, Text, Block, Image } from '@tarojs/components';
import Taro, { showModal, showToast, useRouter } from '@tarojs/taro';
import { useSelector, useDispatch } from 'react-redux';
import cls from 'classnames';
// import { Popup } from 'components/index';
import { fetchCancellationUser } from 'api/index';
import { TAB, URL } from 'constants/router';
import IconCancellation from '../../assets/icon-cancellation.png';

import cx from './index.module.scss';

const AccountCancellation: FC = () => {
  const dispatch = useDispatch();
  const [cancellationVisible, setCancellationVisible] = useState<boolean>(false);

  const handleCancellation = useCallback(() => {
    setCancellationVisible(true);
  }, []);

  const handleBack = useCallback(() => {
    Taro.navigateBack({ delta: 1 });
  }, []);

  const handleConfirm = useCallback(async () => {
    try {
      Taro.showLoading({ title: '注销中' });
      const { status } = await fetchCancellationUser();
      handleCancel();
      cancelSuccess(status);
    } catch (error) {
      console.log(error, '---');
      cancelSuccess(error.status);
    } finally {
      Taro.hideLoading();
    }
  }, []);

  const cancelSuccess = (status: any) => {
    if (status === 200) {
      showModal({
        title: '注销成功',
        content: '账号已提交注销，注销保护期7天，保护期内该手机号码不可以再次注册',
        cancelText: '随便逛逛',
        confirmText: '去登录',
        cancelColor: '#EF433E',
        confirmColor: '#666666',
        success: (res) => {
          Taro.removeStorageSync('X_AUTH_TOKEN');
          Taro.removeStorageSync('userInfo');
          Taro.removeStorage({ key: 'wxUserInfo' });
          dispatch({ type: 'globalsState/setAccessToken', payload: { accessToken: '' } });
          if (res.confirm) {
            Taro.redirectTo({ url: URL['login'] });
          } else {
            Taro.redirectTo({ url: TAB['circle'] });
          }
        }
      });
    } else if (status === 1111038) {
      showModal({ title: '注销失败', content: '禁止注销，当前有正在进行的活动，活动终止后方可注销' });
    } else if (status === 1111037) {
      showModal({ title: '注销失败', content: '禁止注销，当前账号为社团团长，请联系您的客户经理解除社团绑定方可注销' });
    } else {
      Taro.showToast({ title: '注销失败，请稍后重试', icon: 'none' });
    }
  };

  const handleCancel = useCallback(() => {
    setCancellationVisible(false);
  }, []);

  return (
    <Block>
      <View className={cx['cancellation']}>
        <Image src={IconCancellation} className={cx['cancellation-icon']} />
        <View className={cx['cancellation-header']}>
          <View className={cx['cancellation-header-title']}>注销后将放弃所有资产与权益</View>
          <View className={cx['cancellation-header-subtitle']}>请您务必阅读并确认以下信息</View>
        </View>
        <View className={cx['cancellation-body']}>
          <View className={cx['cancellation-cell-items']}>
            <View className={cx['cancellation-item']}>
              <Text>●</Text>身份、账号信息、会员权益等资产将被清空且无法恢复
            </View>
            <View className={cx['cancellation-item']}>
              <Text>●</Text>账号注销后视作您自动放弃所有权益
            </View>
            <View className={cx['cancellation-item']}>
              <Text>●</Text>交易记录将清空
            </View>
            <View className={cx['cancellation-item']}>
              <Text>●</Text>请在操作前自行备份账号相关的所有信息和数据
            </View>
            <View className={cx['cancellation-item']}>
              <Text>●</Text>账号注销不代表注销前的账号行为和相关责任得到豁免或减轻
            </View>
          </View>
          <View className={cx['cancellation-item-desc']}>
            如果存在正在进行中的订单，将无法注销账户，需要在订单完成15天后再注销账号
          </View>
        </View>
        <View className={cx['cancellation-footer']}>
          <View className={cx['cancellation-btn']} onClick={handleCancellation}>
            申请注销
          </View>
          <View className={cx['cancellation-btn-cancel']} onClick={handleBack}>
            我再想想
          </View>
          <View className={cx['cancellation-btn-desc']}>点击申请注销即表示已经清楚注销账号后果</View>
        </View>
      </View>
      {/* <Popup
        visible={cancellationVisible}
        rootCls={cx['cancellation-popup']}
        customTitle={<View className={cx['cancellation-popup-title']}>请您谨慎操作</View>}
        footer={
          <View className={cx['cancellation-popup-footer']}>
            <View className={cls(cx['cancellation-btn'], cx['cancellation-confirm'])} onClick={handleConfirm}>
              立即注销
            </View>
            <View className={cls(cx['cancellation-btn'], cx['cancellation-cancel'])} onClick={handleCancel}>
              我再想想
            </View>
          </View>
        }
      >
        <View className={cx['cancellation-again-tips']}>
          您的账号即将注销，注销服务后，将无法继续使用任何热爱光年相关的服务，也将无法找回您与热爱光年相关的任何内容和信息
        </View>
      </Popup> */}
    </Block>
  );
};
export default memo(AccountCancellation);
