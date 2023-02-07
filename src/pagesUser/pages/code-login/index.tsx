import React, { FC, memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Taro from '@tarojs/taro';
import { View, Label, Input, Button, Block } from '@tarojs/components';
import cls from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { TaroNavigationBar } from 'components/index';
import { checkPhone, checkCode, checkTestPhone } from 'utils/validation';
import logger from 'utils/logger';

import { fetchVerifyCode } from 'api/index';

import Protocol from '../../components/Protocol';

import cx from './index.module.scss';

let timeFun: NodeJS.Timer;

const CodeLogin: FC = () => {
  const dispatch = useDispatch();
  const { phoneValid, codeValid, phoneNumber, verificationCode } = useSelector(({ loginState }) => loginState);
  const { globalsState } = useSelector(({ globalsState }) => ({
    globalsState
  }));
  const { accountInfo } = useMemo(() => globalsState, [globalsState]);
  const checkValidationPhone = ['release', 'develop'].includes(accountInfo.miniProgram.envVersion)
    ? checkPhone
    : checkTestPhone;
  const phoneRef = useRef<any>();
  const protocolRef = useRef<any>();
  const [isAgreement, setIsAgreement] = useState<boolean>(false);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [time, setTime] = useState<number>(60);

  useEffect(() => {
    // phoneRef.current?.setAttribute('focus', true);
    clearInterval(timeFun);
    return () => {
      dispatch({
        type: 'loginState/setState',
        payload: { phoneNumber: '', verificationCode: '', phoneValid: false, codeValid: false }
      });
      clearInterval(timeFun);
    };
  }, []);

  useEffect(() => {
    if (btnDisabled && time > 0 && time < 60) {
    } else {
      setBtnDisabled(false);
      setTime(60);
      clearInterval(timeFun);
    }
  }, [time]);

  const sendVerifyCode = useCallback(async () => {
    if (!isAgreement) return Taro.showToast({ title: '请阅读并勾选底部协议', icon: 'none' });
    if (!phoneValid && phoneNumber) return Taro.showToast({ title: '手机号有误，请重新输入', icon: 'none' });
    if (!phoneNumber) return Taro.showToast({ title: '请先输入手机号', icon: 'none' });
    if (!phoneValid && !phoneNumber) return;
    try {
      await fetchVerifyCode({ userMobile: phoneNumber });
      setBtnDisabled(true);
      timeFun = setInterval(() => setTime((t) => --t), 1000);
      Taro.showToast({ title: '验证码已发送，请注意查收', icon: 'none' });
    } catch (error) {
      Taro.showToast({ title: error?.message || '发送失败', icon: 'none' });
      logger.error('Logger::user/sendMsgCode:index -> fn sendVerifyCode -> e', {
        error: error
      });
      console.log('error:', error);
    }
  }, [phoneValid, isAgreement, phoneNumber]);

  const handlePhoneChange = useCallback(
    ({ detail }) => {
      const phoneNumber = detail.value.replace(/[^\d]/g, '');
      dispatch({ type: 'loginState/setState', payload: { phoneNumber } });
    },
    [dispatch]
  );
  const handlePhoneBlur = useCallback(
    ({ detail }) => {
      const phoneNumber = detail.value.replace(/[^\d]/g, '');
      if (!checkValidationPhone(phoneNumber) && phoneNumber) {
        Taro.showToast({ title: '手机号有误，请重新输入', icon: 'none' });
      }
      dispatch({ type: 'loginState/setState', payload: { phoneValid: checkValidationPhone(phoneNumber) } });
    },
    [dispatch]
  );
  const handleCodeChange = useCallback(
    (event) => {
      const verificationCode = event.detail.value;
      dispatch({
        type: 'loginState/setState',
        payload: { verificationCode, codeValid: checkCode(verificationCode) }
      });
    },
    [dispatch]
  );
  const onClear = useCallback((type) => {
    dispatch({ type: 'loginState/setState', payload: { [type]: '' } });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!protocolRef.current.isAgreement) return Taro.showToast({ title: '请阅读并勾选底部协议', icon: 'none' });
    await dispatch({ type: 'loginState/vxUserLoginRegister' });
  }, [phoneValid, codeValid]);

  return (
    <Block>
      <TaroNavigationBar back home />
      <View className={cx['code-login']}>
        <View className={cx['code-login-title']}>手机验证码登录</View>
        <View className={cx['code-login-form']}>
          <Label className={cx['login-wrap']}>
            <View className={cx['login-wrap-input']}>
              <Input
                className={cx['login-input']}
                type="number"
                value={phoneNumber}
                ref={phoneRef}
                focus
                confirmHold
                maxlength={11}
                placeholder="请输入手机号"
                onInput={handlePhoneChange}
                onBlur={handlePhoneBlur}
              />
              <View className={cx['login-right']}>
                {/* {phoneNumber && (
                  <Avatar
                    src='https://s1.ax1x.com/2022/10/27/xfl9FP.png'
                    rootCls={cx['login-phone-clear']}
                    shape='rounded'
                    size={26}
                    onAvatar={() => onClear('phoneNumber')}
                  />
                )} */}
                <View
                  className={cls(cx['login-code-btn'], {
                    [cx['code-disabled']]: btnDisabled
                  })}
                  onClick={() => !btnDisabled && sendVerifyCode()}
                >
                  获取验证码
                </View>
              </View>
            </View>
          </Label>
          <Label className={cx['login-wrap']}>
            <View className={cx['login-wrap-input']}>
              <Input
                className={cx['login-input']}
                type="number"
                value={verificationCode}
                maxlength={6}
                placeholder="请输入验证码"
                onInput={handleCodeChange}
              />
              <View className={cx['login-right']}>
                {/* {verificationCode && (
                  <Avatar
                    src='https://s1.ax1x.com/2022/10/27/xfl9FP.png'
                    rootCls={cx['login-code-clear']}
                    shape='rounded'
                    size={26}
                    onAvatar={() => onClear('verificationCode')}
                  />
                )} */}
                {btnDisabled && <View className={cx['count-down-timer']}>{time}</View>}
              </View>
            </View>
          </Label>
        </View>
        <Button
          disabled={!phoneValid || !codeValid}
          className={cls(cx['code-login-btn'], {
            [cx['login-btn-disabled']]: !phoneValid || !codeValid
          })}
          onClick={handleSubmit}
          formType="submit"
        >
          登录
        </Button>
        <Protocol
          ref={protocolRef}
          checkIcon="https://s1.ax1x.com/2022/10/27/xfa2rV.png"
          unCheckedIcon="https://s1.ax1x.com/2022/10/26/xWIHIJ.png"
          protocolText={cx['protocol-text']}
          protocolUser={cx['protocol-user']}
          onClick={setIsAgreement}
        />
      </View>
    </Block>
  );
};

export default memo(CodeLogin);
