import { useState, useEffect, FC, memo, useMemo, useCallback, useLayoutEffect, lazy, Suspense, useRef } from 'react';
import { View, Input, Button, Text, Block, Picker } from '@tarojs/components';
import Taro, { showModal, usePageScroll, useRouter } from '@tarojs/taro';
import { useSelector, useDispatch } from 'react-redux';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import isFunction from 'lodash/isFunction';
import isEmpty from 'lodash/isEmpty';
import compact from 'lodash/compact';
import dayjs from 'dayjs';
import cls from 'classnames';
import { UCell, Avatar, TaroNavigationBar, EmptyPage } from 'components/index';
import { TAB, URL } from 'constants/router';
import IconDefaultAvatar from 'assets/icon-default-avatar.png';
import useForceUpdate from 'hooks/useForceUpdate';
import { TaroUploadFile } from 'utils/request';
import { realAgeFunc } from 'utils/index';
import { phoneSecret } from 'utils/validation';
import UCellPopup from '../../components/UCellPopup';
import cx from './index.module.scss';

const ModifyInfo: FC = () => {
  const dispatch = useDispatch();
  const { modifyState, mineState, globalsState } = useSelector(({ modifyState, mineState, globalsState }) => ({
    modifyState,
    mineState,
    globalsState
  }));
  const {
    MBTI_TYPE,
    constellation_type,
    sex_type,
    labelTypeList = [],
    initLoading,
    isNetwork
  } = useMemo(() => modifyState, [modifyState]);
  const { userInfo, circleInfo, characterList } = useMemo(() => mineState, [mineState]);
  const {
    system: { navBarHeight, navBarExtendHeight }
  } = useMemo(() => globalsState, [globalsState]);
  const [userModifyInfo, setUserModifyInfo] = useState<any>({});
  const [navBarInfo, setNavBarInfo] = useState<any>({
    color: '#ffffff',
    background: `linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)`
  });
  const forceUpdate = useForceUpdate();
  const characterIdsRef = useRef<any>([]);
  const circleNames = !isEmpty(circleInfo) ? circleInfo.map((item) => item.circleName) : [];

  const loginUserInfo = Taro.getStorageSync('userInfo');

  usePageScroll(({ scrollTop }) => {
    const navOp = scrollTop / (navBarHeight + navBarExtendHeight);
    setNavBarInfo((preState) =>
      Object.assign({}, preState, {
        background:
          scrollTop > 10
            ? `rgba(255, 255, 255, ${navOp > 1 ? 1 : navOp})`
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)',
        color: scrollTop > 10 ? '#333333' : '#ffffff'
      })
    );
  });
  useLayoutEffect(() => {
    dispatch({ type: 'modifyState/queryLabelTypeList', payload: { labelType: '用户风格/STYLE LABEl' } });
    dispatch({ type: 'modifyState/queryDictionaryType', payload: { type: 'MBTI_TYPE' } });
    dispatch({ type: 'modifyState/queryDictionaryType', payload: { type: 'constellation_type' } });
  }, [dispatch]);
  useEffect(() => {
    Taro.showLoading();
    dispatch({ type: 'mineState/queryMineUserInfo' }).then(
      ({
        birthday,
        coverImg,
        major,
        nickName,
        profilePicture,
        signature,
        sex,
        characterType,
        constellation,
        province,
        area,
        city
      }) => {
        Taro.hideLoading();
        setUserModifyInfo({
          birthday,
          coverImg,
          major,
          characterIds: characterIdsRef.current,
          nickName,
          profilePicture,
          signature,
          sex: [1, 2, 3].includes(sex) ? sex : 3,
          age: birthday ? realAgeFunc(birthday) : 0,
          characterType,
          constellation,
          province,
          area,
          city
        });
      }
    );
  }, []);
  useEffect(() => {
    if (!isEmpty(characterList) && !isEmpty(labelTypeList)) {
      characterIdsRef.current = !isEmpty(characterList)
        ? labelTypeList
            .map((item: any) => ((characterList as any).includes(item.labelName) ? item.labelId : ''))
            ?.filter((item) => item)
        : [];
      setUserModifyInfo((preState) => ({ ...preState, characterIds: characterIdsRef.current }));
    }
  }, [labelTypeList, characterList]);

  const onClickPress = useCallback(() => {
    checkModifyInfo(
      () => Taro.navigateTo({ url: URL['modify-circle-label'] }),
      () => Taro.navigateTo({ url: URL['modify-circle-label'] })
    );
  }, [userModifyInfo]);

  const onChooseAvatar = useCallback(({ detail }) => {
    setUserModifyInfo((preState) => {
      return { ...preState, profilePicture: detail.avatarUrl };
    });
  }, []);

  const chooseModifyCover = useCallback(() => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera', 'album'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        console.log(res, 'res--');
        const tempFilePaths = res.tempFilePaths?.[0];
        // 获取图片开始压缩
        wx.compressImage({
          src: tempFilePaths,
          quality: 80, // 压缩质量
          success: (res) => {
            console.log(res.tempFilePath, res);
            dispatch({
              type: 'cropperImageState/setState',
              payload: {
                cropperUrl: res.tempFilePath,
                callback: async (res) => {
                  const coverImg = await TaroUploadFile(res, { type: 3 }, 'user/uploadImg');
                  setUserModifyInfo((preState) => ({ ...preState, coverImg }));
                  console.log(res, 'cropperImageState');
                }
              }
            });
            Taro.navigateTo({ url: URL['cropper-image'] + '?w=750&h=980' });
          },
          fail: (error) => {
            console.log(error);
          }
        });
      }
    });
  }, []);

  // 修改内容回回调理
  const handelConfirm = useCallback(({ cellInfo, valueKey, callback }) => {
    console.log(cellInfo, valueKey);
    setUserModifyInfo((preState) => {
      const age = valueKey == 'birthday' ? { age: realAgeFunc(cellInfo.cellValue) } : {};
      const [province = '', city = '', area = ''] =
        valueKey == 'region' ? cellInfo.cellValue : compact([preState.province, preState.city, preState.area]);
      const results = {
        ...preState,
        province,
        city,
        area,
        [valueKey]: valueKey == 'sex' ? Number(cellInfo.cellItem.cellValue) : cellInfo.cellValue
      };
      return { ...results, ...age };
    });
    callback?.();
  }, []);
  /**
   * @description 用户信息更新
   * @step 检测封面和头像是不是临时文件 否则不进行上传
   */
  const handleSubmit = async (callback) => {
    let profilePicture = userModifyInfo.profilePicture;
    let coverImg = userModifyInfo.coverImg;
    console.log(userModifyInfo, 'userModifyInfo');

    if (profilePicture.includes('tmp')) {
      profilePicture = await TaroUploadFile(profilePicture, { type: 1 }, 'user/uploadImg');
    }
    if (coverImg.includes('tmp')) {
      coverImg = await TaroUploadFile(coverImg, { type: 3 }, 'user/uploadImg');
    }
    // delete userModifyInfo.region;
    await dispatch({
      type: 'userState/updateUserInfo',
      payload: Object.assign(userModifyInfo, {
        profilePicture,
        coverImg,
        characterIds: isEmpty(userModifyInfo.characterIds) ? [0] : userModifyInfo.characterIds
      }),
      callback: () => {
        Taro.showToast({ title: '更新成功', icon: 'none' });
        if (isFunction(callback)) {
          return callback?.();
        }
        // dispatch({ type: 'mineState/queryMineUserInfo' });
        setTimeout(() => {
          Taro.switchTab({ url: TAB['mine'] });
        }, 300);
        // callback?.();
      }
    });
  };

  // 检测用户有没有在编辑状态，返回获取去首页提示用户
  const checkModifyInfo = useCallback(
    (onConfirm: () => void, onCancel?: () => void) => {
      Taro.showModal({
        title: '温馨提示',
        content: '当前页面有未保存的内容，是否保存？',
        cancelColor: '#333333',
        confirmColor: '#FD2A53',
        confirmText: '保存',
        success: async (res) => {
          if (res.confirm) {
            await handleSubmit(onConfirm);
          } else {
            onCancel?.();
          }
        }
      });
    },
    [userModifyInfo]
  );
  const handleBack = () => {
    const pages: any = Taro.getCurrentPages();
    if (pages.length >= 2) {
      Taro.navigateBack({
        delta: 1
      });
    } else {
      Taro.switchTab({ url: TAB['mine'] });
    }
  };
  const handleGoBack = useCallback(() => {
    checkModifyInfo(handleBack, handleBack);
  }, [userModifyInfo]);

  const handleGoHome = useCallback(() => {
    checkModifyInfo(
      () => {
        Taro.switchTab({ url: TAB['circle'] });
      },
      () => {
        Taro.switchTab({ url: TAB['circle'] });
      }
    );
  }, [userModifyInfo]);

  return (
    <Block>
      <TaroNavigationBar title='资料修改' isImmersive {...navBarInfo} onHome={handleGoHome} onBack={handleGoBack} />
      {isNetwork && (
        <EmptyPage
          showButton
          onReload={() => {
            dispatch({ type: 'mineState/setState', payload: { initLoading: true, isNetwork: false } });
            dispatch({ type: 'mineState/queryMineUserInfo' });
          }}
        />
      )}
      {!initLoading && (
        <View
          className={cls(cx['modify-info-page'], 'safe-area-inset-bottom')}
          style={{
            backgroundImage: `url(${
              userModifyInfo.coverImg ? userModifyInfo.coverImg : 'https://s1.ax1x.com/2022/10/27/xhZIzj.png'
            })`
          }}
        >
          <View className={cx['modify-info-space']} />
          {/* <View style={{ height: 230 }} /> */}
          <View className={cx['modify-info-top']} />
          <View className={cx['modify-info-body']}>
            <View className={cx['modify-cover-wrap']}>
              <View className={cx['modify-cover-image']} onClick={chooseModifyCover}>
                修改封面
              </View>
            </View>
            <View className={cx['cell-group']}>
              <Button className={cx['cell-avatar-btn']} openType='chooseAvatar' onChooseAvatar={onChooseAvatar}>
                <UCell title='头像' centered valueCls={cx['cell-value']}>
                  <View className={cx['cell-avatar']}>
                    <Avatar src={userModifyInfo.profilePicture || IconDefaultAvatar} shape='circle' size={116} />
                  </View>
                </UCell>
              </Button>
              <UCellPopup
                fieldType='input'
                title='名字'
                placeholder='请输入名字'
                pickerTitle='名字'
                value={userModifyInfo.nickName}
                data-valueKey='nickName'
                onConfirm={handelConfirm}
              />
              <UCellPopup
                fieldType='textarea'
                title='个性签名'
                placeholder='请输入个性签名'
                pickerTitle='个性签名'
                maxlength={50}
                value={userModifyInfo.signature}
                data-valueKey='signature'
                onConfirm={handelConfirm}
              />
              <UCell
                title='绑定手机'
                value={phoneSecret(loginUserInfo.userMobile)}
                placeholder='暂未绑定'
                rightIcon={false}
              />
              <UCell
                title='注册时间'
                value={loginUserInfo.registerTime ? dayjs(loginUserInfo.registerTime).format('YYYY-MM-DD') : ''}
                rightIcon={false}
              />
              <UCellPopup
                mode='selector'
                title='性别'
                fieldType='sex'
                value={userModifyInfo.sex}
                dataSource={sex_type}
                placeholder='请选择性别'
                data-valueKey='sex'
                onConfirm={handelConfirm}
              />
              <UCellPopup
                mode='date'
                title='年龄'
                placeholder='请选择年龄'
                value={userModifyInfo.birthday}
                data-valueKey='birthday'
                onConfirm={handelConfirm}
              />
              <UCellPopup
                mode='region'
                title='城市'
                value={compact([
                  userModifyInfo.province == '0' ? '' : userModifyInfo.province,
                  userModifyInfo.city == '0' ? '' : userModifyInfo.city,
                  userModifyInfo.area == '0' ? '' : userModifyInfo.area
                ])}
                placeholder='请选择城市'
                data-valueKey='region'
                onConfirm={handelConfirm}
              />
              <UCellPopup
                mode='selector'
                title='星座'
                value={userModifyInfo.constellation}
                data-valueKey='constellation'
                dataSource={constellation_type}
                placeholder='请选择星座'
                onConfirm={handelConfirm}
              />
              <UCellPopup
                mode='selector'
                title='MBTI'
                value={userModifyInfo.characterType}
                data-valueKey='characterType'
                placeholder='请选择MBTI'
                dataSource={MBTI_TYPE}
                onConfirm={handelConfirm}
              />
              <UCellPopup
                title='专业'
                fieldType='input'
                pickerTitle='专业'
                placeholder='请输入专业'
                value={userModifyInfo.major}
                data-valueKey='major'
                onConfirm={handelConfirm}
              />
              <UCell
                title='圈子标签'
                value={circleNames?.join('、')}
                placeholder='请选择圈子标签'
                onClickPress={onClickPress}
              />
              <UCellPopup
                title='圈子风格'
                bordered={false}
                fieldType='TagsSkills'
                pickerTitle='选择风格标签'
                placeholder='请选择风格标签'
                dataSource={labelTypeList}
                value={userModifyInfo.characterIds}
                data-valueKey='characterIds'
                onConfirm={handelConfirm}
              />
            </View>
          </View>
          <View className={cls(cx['footer-wrap'], 'safe-area-inset-bottom')}>
            <View className={cx['footer-btn']} onClick={handleSubmit}>
              确定
            </View>
          </View>
        </View>
      )}
    </Block>
  );
};
export default memo(ModifyInfo);
