import { FC, memo, useCallback, useEffect, useState, useMemo, ReactNode } from 'react';
import { View, Button, Block, Text, Image } from '@tarojs/components';
import Taro, { showModal, showToast, exitMiniProgram, useDidShow } from '@tarojs/taro';
import { useSelector, useDispatch } from 'react-redux';
import cls from 'classnames';
import { isEmpty } from 'lodash';

import { TAB, URL , formatWebUrl } from 'constants/router';
import { Avatar, UCell, Popup } from 'components/index';
import { jumpWebview, stringifyQuery } from 'utils/utils';
import { handleUpdate } from 'utils/taroUpdateManager';

import { fetchUserCommunityApplyInfo } from 'api/circle-community';

import IconQrcodePublicAccount from '../../assets/icon-qrcode-public-account.jpg';

import cx from './index.module.scss';

interface ICommunityApply {
  applyDesc: string;
  communityName: string;
  applyId: unknown;
  applyStatus: '0' | '1' | '2' | string;
}

interface IPopupInfo {
  title: string;
  isVisible: boolean;
  footer: ReactNode | unknown;
  type: 'qrcode' | 'email' | string;
}

const applyStatusText: { [key: string]: string } = {
  0: '申请中',
  1: '',
  2: '未通过'
};
const SystemSettings: FC = () => {
  const { globalsState, mineState } = useSelector(({ globalsState, mineState }) => ({ globalsState, mineState }));
  const {
    storageInfoSync,
    accountInfo: { miniProgram }
  } = useMemo(() => globalsState, [globalsState]);
  const { isCommunity } = useMemo(() => mineState, [mineState]);
  const dispatch = useDispatch();
  const [communityApplyInfo, setCommunityApplyInfo] = useState<ICommunityApply>({
    applyDesc: '',
    communityName: '',
    applyStatus: '',
    applyId: ''
  });
  const [popupInfo, setPopupInfo] = useState<IPopupInfo>({
    title: '',
    isVisible: false,
    footer: null,
    type: ''
  });
  useDidShow(() => {
    queryCommunityApplyStatus();
  });
  useEffect(() => {
    console.log(storageInfoSync, 'getStorageInfoSync');
  }, []);
  // 查询社团认证信息
  const queryCommunityApplyStatus = async () => {
    try {
      const { status, data } = await fetchUserCommunityApplyInfo();
      if (status === 200) {
        setCommunityApplyInfo(data);
      }
    } catch (error) {}
  };

  const handleLogout = useCallback(() => {
    showModal({
      title: '确认退出登录',
      content:
        '如需切换其他账号，请退出后重新登录并在授权弹窗中选择"使用其他手机号"，退出后不会删除历史数据,下次登录依然可以使用本账号',
      cancelText: '取消',
      confirmText: '退出登录',
      confirmColor: '#1c1c1e',
      cancelColor: '#8D8E93',
      success: (res) => {
        console.log(res, '----');
        if (res.confirm) {
          showToast({
            title: '退出成功',
            icon: 'success',
            success: () => {
              Taro.removeStorageSync('X_AUTH_TOKEN');
              Taro.removeStorageSync('userInfo');
              dispatch({ type: 'globalsState/setAccessToken', payload: { accessToken: '' } });
              Taro.reLaunch({ url: URL['login'] });
            }
          });
        }
      }
    });
  }, [showModal, showToast]);

  const handleClick = useCallback(async (actionType: string) => {
    switch (actionType) {
      case 'update-manager':
        showToast({ title: '正在更新版本...', icon: 'loading' });
        await handleUpdate('check-manual-update');
        break;
      case 'clear-storage':
        showModal({
          content: '确定清除缓存并退出小程序？',
          confirmText: '确定清除',
          cancelColor: '#333333',
          confirmColor: '#FD2A53',
          success: (res) => {
            if (res.confirm) {
              exitMiniProgram({
                success: (res) => {
                  dispatch({ type: 'globalsState/clearAppStore' });
                  Taro.clearStorage();
                  Taro.clearStorageSync();
                  console.log('退出成功->可以设置回调事件');
                },
                fail: () => {
                  console.log('调用失败了');
                }
              });
            }
          }
        });
        break;
      case 'cancellation':
        Taro.showModal({
          title: '系统提示',
          content: '注销后不可恢复，是否继续？',
          cancelText: '继续注销',
          confirmText: '我再想想',
          cancelColor: '#EF433E',
          confirmColor: '#666666',
          success: (res) => {
            if (res.cancel) {
              Taro.navigateTo({ url: URL[actionType] });
            }
          }
        });
        break;
      case 'modify-info':
      case 'scan-code':
        Taro.navigateTo({ url: URL[actionType] });
        break;
      default:
        break;
    }
  }, []);

  const handleGoWebview = (type: string, isNeedLogin: boolean = true) => {
    jumpWebview({ url: formatWebUrl(type), isNeedLogin });
  };
  const handleCommunityApply = (url: string, query = {}) => {
    jumpWebview({ url: formatWebUrl(url), query });
  };

  const handleCopyEmail = useCallback(() => {
    Taro.setClipboardData({
      data: CUSTOM_EMAIL,
      success: function () {
        Taro.showToast({ title: '内容已复制' });
        handlePopupCancel();
      }
    });
  }, []);

  const renderCommunityApply = useMemo(() => {
    const { applyStatus, communityName, applyId } = communityApplyInfo;
    if (isEmpty(applyStatus))
      return (
        <View className={cx['community-apply']} onClick={() => handleCommunityApply('applyCertification', { applyId })}>
          未认证
        </View>
      );
    if (['0', '2'].includes(applyStatus)) {
      return (
        <View
          className={cls(cx['community-apply'])}
          onClick={() => handleCommunityApply('certificationAuditResults', { applyId })}
        >
          <div
            className={cls(
              cx['community-apply-status'],
              cx[`community-apply-${applyStatus == '2' ? 'failed' : 'pending'}`]
            )}
          ></div>
          {applyStatusText[applyStatus]}
        </View>
      );
    }
    return (
      <View className={cx['community-apply']} onClick={() => handleCommunityApply('communityCertification')}>
        {communityName}
      </View>
    );
  }, [communityApplyInfo]);

  const handleCustomClick = useCallback((type: string) => {
    setPopupInfo({
      title: type === 'email' ? '邮箱地址' : '关注公众号',
      isVisible: true,
      footer:
        type === 'email' ? (
          <View className={cx['custom-btn']} onClick={handleCopyEmail}>
            复制邮件地址
          </View>
        ) : null,
      type
    });
  }, []);
  const renderPopupContent = useMemo(() => {
    if (popupInfo.type === 'email') {
      return (
        <View className={cx['custom-content']}>
          向<Text className={cx['custom-email']}>{CUSTOM_EMAIL}</Text>
          发送邮件
        </View>
      );
    }
    if (popupInfo.type === 'qrcode') {
      return (
        <View className={cx['popup-qrcode-content']}>
          <Image src={IconQrcodePublicAccount} mode='aspectFill' lazyLoad showMenuByLongpress />
        </View>
      );
    }
    return <Block />;
  }, [popupInfo.isVisible, popupInfo.type]);

  const handlePopupCancel = useCallback(() => {
    setPopupInfo({ title: '', footer: null, type: '', isVisible: false });
  }, []);

  return (
    <Block>
      <View className={cx['system-settings']}>
        <View className={cx['cell-group']}>
          <UCell title='资料修改' onClickPress={() => handleClick('modify-info')} />
          <UCell title='社团认证' bordered={isCommunity}>
            {renderCommunityApply}
          </UCell>
          {/* 只有是社团才开启功能 */}
          {isCommunity && (
            <Block>
              <UCell title='二维码核销' placeholder='社团商户有该权限' onClickPress={() => handleClick('scan-code')} />
              <UCell title='核销记录' bordered={false} onClickPress={() => handleGoWebview('writeOffList')} />
            </Block>
          )}
        </View>
        <View className={cx['cell-group']}>
          <UCell title='联系客服' onClickPress={() => handleCustomClick('email')} />
          <UCell title='关注公众号' onClickPress={() => handleCustomClick('qrcode')} />
          <UCell title='隐私政策' onClickPress={() => handleGoWebview('privacyPolicy', false)} />
          <UCell title='用户协议' onClickPress={() => handleGoWebview('userAgreement', false)} />
          <UCell
            title='清除缓存'
            placeholder={`${storageInfoSync.currentSize}KB`}
            onClickPress={() => handleClick('clear-storage')}
          />
          <UCell
            title='检查更新'
            placeholder={miniProgram.version}
            onClickPress={() => handleClick('update-manager')}
          />
          <Button openType='feedback' className={cx['cell-button']}>
            <UCell title='帮助与反馈' />
          </Button>
          <UCell title='系统设置' onClickPress={() => Taro.openSetting()} />
          <UCell
            title='注销账号'
            bordered={false}
            placeholder='服务注销后不可恢复'
            onClickPress={() => handleClick('cancellation')}
          />
        </View>
        <View className={cls(cx['footer'], 'safe-area-inset-bottom ')}>
          <View className={cls(cx['footer-wrapper'])}>
            <View className={cx['logout-btn']} onClick={handleLogout}>
              退出登录
            </View>
          </View>
        </View>
      </View>
      {popupInfo.isVisible && (
        <Popup
          visible={popupInfo.isVisible}
          title={popupInfo.title}
          rounded
          footer={popupInfo.footer}
          onCancel={() => handlePopupCancel()}
        >
          {renderPopupContent}
        </Popup>
      )}
    </Block>
  );
};

export default memo(SystemSettings);
