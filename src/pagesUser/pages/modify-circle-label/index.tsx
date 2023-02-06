import { FC, memo, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { View, Image, MovableArea, MovableView, Block } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import cls from 'classnames';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { useSelector, useDispatch } from 'react-redux';

import { UCell, UCellGroup, Avatar, EmptyPage } from 'components/index';

import { URL } from 'constants/router';
import { stringifyQuery } from 'utils/utils';

import cx from './index.module.scss';

const ModifyCircleLabel: FC = () => {
  const dispatch = useDispatch();
  const { modifyState, mineState, loading } = useSelector(({ modifyState, mineState, loading }) => ({
    modifyState,
    mineState,
    loading
  }));
  const { circleLabelList } = useMemo(() => modifyState, [modifyState]);
  const { circleInfo = [] } = useMemo(() => mineState, [mineState]);
  const [isDragOpen, setIsDragOpen] = useState<boolean>(false);
  const [isNetwork, setIsNetWork] = useState<boolean>(false);
  const [changeId, setChangeId] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useDidShow(() => {
    initLoad();
  });
  const initLoad = () => {
    Promise.all([
      dispatch({ type: 'mineState/queryMineUserInfo' }),
      dispatch({ type: 'modifyState/queryCircleLabelList' })
    ])
      .catch(() => {
        setIsNetWork(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleDragOpen = () => {
    if (isDragOpen) {
      return;
    }
    setIsDragOpen(!isDragOpen);
  };

  const handleTagSkills = ({ circleId, circleName }: any) => {
    const params = { circleName, circleId };
    Taro.navigateTo({ url: URL['modify-circle-tag-skills'] + stringifyQuery(params) });
  };

  if (isLoading) return <Block />;
  if (isNetwork)
    return (
      <EmptyPage
        showButton
        showBackBtn
        onReload={() => {
          setIsNetWork(false);
          setIsLoading(true);
          initLoad();
        }}
      />
    );

  return (
    <View className={cls(cx['circle-label-page'], 'safe-area-inset-bottom')}>
      {Array.isArray(circleInfo) && !isEmpty(circleInfo) && (
        <UCellGroup title='已添加圈子'>
          <View className={cx['circle-label-card']}>
            {map(circleInfo, (item, index) => (
              <UCell
                title={item.circleName}
                key={item.circleId}
                bordered={index + 1 < circleInfo.length}
                onClickPress={() => handleTagSkills(item)}
              />
            ))}
          </View>
        </UCellGroup>
      )}
      {Array.isArray(circleLabelList) && !isEmpty(circleLabelList) && (
        <UCellGroup title='所有圈子'>
          <View className={cx['circle-label-card']}>
            {map(circleLabelList, (item, index) => (
              <UCell
                title={item.circleName}
                key={item.circleId}
                bordered={index + 1 < circleLabelList.length}
                onClickPress={() => handleTagSkills(item)}
              />
            ))}
          </View>
        </UCellGroup>
      )}
    </View>
  );
};

export default memo(ModifyCircleLabel);
