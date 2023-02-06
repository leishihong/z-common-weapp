import React, { FC, memo, useCallback, useMemo, useState, useEffect } from 'react';
import { View, Block, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import cls from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { isEmpty, map, compact } from 'lodash';
import { Avatar } from 'components/index';

import { URL, formatWebUrl } from 'constants/router';
import { jumpWebview } from 'utils/utils';

import IconDefaultAvatar from 'assets/icon-default-avatar.png';

import IconArrowRight from '../../assets/icon-arrow-right.png';
import IconNoPhoto from '../../assets/icon-no-photo.png';
import cx from './index.module.scss';

const MineUserInfo: FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userHomeProfileState, globalsState } = useSelector(({ globalsState, userHomeProfileState }) => ({
    globalsState,
    userHomeProfileState
  }));
  const {
    system: { navBarHeight, navBarExtendHeight }
  } = useMemo(() => globalsState, [globalsState]);
  const {
    fellowInfo,
    charList = [],
    labelList = [],
    characterList = [],
    userInfo,
    fellowUserCount,
    associationCount,
    fansCount,
    profilePicture,
    imgList = [],
    nickName,
    major,
    sex,
    constellation,
    characterType,
    birthday
  } = useMemo(() => userHomeProfileState, [userHomeProfileState]);
  const userPhotoAlbumList = useMemo(() => (!isEmpty(imgList) ? imgList.slice(0, 15) : []), [imgList]);
  const [skillIds, setSkillIds] = useState<number[]>(() =>
    !isEmpty(charList) ? charList.map((item) => item.labelId) : []
  );

  const handleGoMinePhoto = useCallback(() => {
    jumpWebview({ url: formatWebUrl('userHomeProfilePhotoAlbum'), query: { ...router.params } });
  }, [router.params]);

  // 用户风格
  const renderLabel = useMemo(() => {
    return (
      <View className={cx['mine-user-style']}>
        <ScrollView scrollX scrollWithAnimation enableFlex className={cx['mine-user-style-scroll']}>
          <View className={cx['mine-user-style-list']}>
            {/* {Array.isArray(charList) && !isEmpty(charList) ? (
              map(charList, (item) => (
                <View className={cx['mine-user-style-item']} key={item.labelId} onClick={handleModifyInfo}>
                  {item.labelName}
                </View>
              ))
            ) : (
              <View className={cx['mine-user-style-item']} onClick={handleModifyInfo}>
                <Avatar src={IconAddLabel} shape="square" size={28} />
                添加标签
              </View>
            )} */}
          </View>
        </ScrollView>
      </View>
    );
  }, [labelList]);

  const renderPhotoAlbumList = useMemo(() => {
    if (!isEmpty(userPhotoAlbumList)) {
      return (
        <View className={cx['mine-user-gallery-list']}>
          {map(
            userPhotoAlbumList,
            (item, index: number) =>
              index < 2 && (
                <View className={cx['mine-user-gallery-item']} key={index} onClick={handleGoMinePhoto}>
                  <Image src={item} mode='aspectFill' />
                </View>
              )
          )}
        </View>
      );
    }
    return (
      <View className={cls(cx['mine-user-gallery-item'], cx['mine-user-gallery-empty'])} onClick={handleGoMinePhoto}>
        <Image src={IconNoPhoto} mode='aspectFill' />
      </View>
    );
  }, [userPhotoAlbumList]);

  const renderUserTag = useMemo(() => {
    const sexInfo = { 1: '男', 2: '女', 0: '未知', 3: '保密' };
    const userinfo = compact([sexInfo[sex], constellation, characterType]);
    if (!isEmpty(userinfo)) {
      return userinfo.join(' | ');
    }
    return '该用户资料待完善';
  }, [sex, birthday, constellation, characterType]);

  return (
    <Block>
      <View style={{ height: navBarHeight + navBarExtendHeight + 70 }} />
      <View className={cx['mine-user-card']}>
        <View className={cx['mine-user-info']}>
          <View className={cx['mine-header']}>
            <View className={cx['mine-user-avatar']} onClick={handleGoMinePhoto}>
              <Avatar src={profilePicture || IconDefaultAvatar} size={136} />
            </View>
            <View className={cx['mine-user-right']}>
              <View className={cx['mine-user-grid']}>
                <View className={cx['mine-user-grid-item']}>
                  <View className={cx['grid-item-count']}>{fellowUserCount || 0}</View>
                  <View className={cx['grid-item-title']}>关注博主</View>
                </View>
                <View className={cx['mine-user-grid-item']}>
                  <View className={cx['grid-item-count']}>{associationCount || 0}</View>
                  <View className={cx['grid-item-title']}>社团</View>
                </View>
                <View className={cx['mine-user-grid-item']}>
                  <View className={cx['grid-item-count']}>{fansCount || 0}</View>
                  <View className={cx['grid-item-title']}>粉丝</View>
                </View>
              </View>
              {/* 暂时隐藏 */}
              {/* <View className={cx['mine-user-footer']}>
                <View className={cx['mine-user-footer-btn']}>我的收藏</View>
                <View className={cx['mine-user-footer-btn']}>我的点赞</View>
              </View> */}
            </View>
          </View>
          <View className={cx['mine-body']}>
            <View className={cx['mine-user-name']}>{nickName}</View>
            <View className={cx['mine-user-tag']}>{renderUserTag}</View>
            <View className={cx['mine-user-profession']}>{major ? major : '专业：暂无'}</View>
            <View className={cx['mine-user-gallery']}>
              {renderPhotoAlbumList}
              {/* <View className={cx['mine-user-gallery-item']}>
                <Image src="https://t7.baidu.com/it/u=1951548898,3927145&fm=193&f=GIF" mode="aspectFill" />
              </View> */}
              <View className={cx['mine-user-gallery-more']} onClick={handleGoMinePhoto}>
                <Avatar src={IconArrowRight} size={24} shape='square' />
              </View>
            </View>
            {/* <View className={cx['mine-user-slogan']}>个性签名个性签名个性签名个性...</View> */}
          </View>
        </View>
      </View>
    </Block>
  );
};
export default memo(MineUserInfo);
