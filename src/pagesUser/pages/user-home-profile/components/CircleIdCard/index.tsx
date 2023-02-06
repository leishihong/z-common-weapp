import { FC, memo, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Block } from '@tarojs/components';
import Taro from '@tarojs/taro';
import cls from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import flattenDeep from 'lodash/flattenDeep';
import compact from 'lodash/compact';
import { Avatar, EmptyPage } from 'components/index';
import { stringifyQuery } from 'utils/utils';
import { URL } from 'constants/router';

import cx from './index.module.scss';

interface IProps {}

const CircleItem: FC<any> = ({ circleName, circleId, circleAge, personalityLabels = [], skillsLabels = [] }) => {
  return (
    <View className={cx['circle-style-item']}>
      <View className={cx['circle-style-age']}>{circleAge || 0}</View>
      <View className={cx['circle-style-header']}>
        <View className={cx['circle-style-title']}>{circleName}</View>
        {/* <View className={cx['circle-style-badge']}>
          <Avatar src={IconZiShen} shape="square" size={40} />
        </View> */}
      </View>
      <View className={cx['circle-style-body']}>
        <View className={cx['circle-style-label']}>
          <View className={cx['circle-style-label-tips']}>技能标签/SKILLS LABEL</View>
          <ScrollView scrollX scrollWithAnimation enableFlex className={cx['circle-style-label-scroll']}>
            <View className={cls(cx['circle-style-label-list'])}>
              {!isEmpty(skillsLabels) ? (
                map(skillsLabels, (item) => (
                  <View className={cls(cx['circle-style-label-item'], cx['skill-label'])} key={item.labelId}>
                    {item.labelName}
                  </View>
                ))
              ) : (
                <View className={cls(cx['circle-style-label-item'], cx['skill-label'], cx['label-empty'])}>
                  {/* <Avatar src={IconAddLabel} shape="square" size={28} /> */}
                  暂无技能标签
                </View>
              )}
            </View>
          </ScrollView>
        </View>
        {
          <View className={cx['circle-style-label']}>
            <View className={cx['circle-style-label-tips']}>个性标签/PERSONALITYLABEL</View>
            <ScrollView
              scrollX
              scrollWithAnimation
              enableFlex
              className={isEmpty(skillsLabels) ? cx['circle-style-label-scroll'] : ''}
            >
              <View className={cls(cx['circle-style-label-list'])}>
                {!isEmpty(personalityLabels) ? (
                  map(personalityLabels, (item) => (
                    <View className={cls(cx['circle-style-label-item'], cx['personality-label'])} key={item.labelId}>
                      {item.labelName}
                    </View>
                  ))
                ) : (
                  <View className={cls(cx['circle-style-label-item'], cx['personality-label'], cx['label-empty'])}>
                    {/* <Avatar src={IconAddLabel} shape="square" size={28} /> */}
                    暂无个性标签
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        }
      </View>
    </View>
  );
};
const CircleIdCard: FC<IProps> = (props) => {
  const { userHomeProfileState } = useSelector(({ globalsState, userHomeProfileState }) => ({
    globalsState,
    userHomeProfileState
  }));
  const { circleInfo } = useMemo(() => userHomeProfileState, [userHomeProfileState]);

  const getLabelIds = () => {
    const personality = circleInfo.map((item) => item.personalityLabels);
    const skills = circleInfo.map((item) => item.skillsLabels);
    return compact(flattenDeep([personality, skills]));
  };
  const handleModifyInfo = useCallback(() => {
    Taro.navigateTo({ url: URL['modify-info'] });
  }, []);

  if (isEmpty(circleInfo))
    return (
      <View style={{ marginTop: '-80px' }}>
        <EmptyPage
          emptyText='Ta这会儿还不太想说话~'
          emptyIcon='https://img.mtaste.cn/prod/img/system/config/3cb4b52e65b04a77bfbd8861046386c4.png'
        />
      </View>
    );

  const formatSkillInfo =
    Array.isArray(circleInfo) && !isEmpty(circleInfo)
      ? circleInfo.filter((item) => {
          if (
            (Array.isArray(item.skillsLabels) && !isEmpty(item.skillsLabels)) ||
            (Array.isArray(item.personalityLabels) && !isEmpty(item.personalityLabels))
          ) {
            return item;
          }
        })
      : [];

  return (
    <View className={cx['mine-circle']}>
      {Array.isArray(circleInfo) &&
        !isEmpty(circleInfo) &&
        map(circleInfo, (item, index: number) => {
          const len: number = circleInfo.length;
          const isSkillsLabel =
            (Array.isArray(item.skillsLabels) && !isEmpty(item.skillsLabels)) ||
            (Array.isArray(item.personalityLabels) && !isEmpty(item.personalityLabels));

          return (
            <Block key={item.circleId}>
              <CircleItem {...item} />
              {index !== len - 1 ? <View className={cx['circle-dashed']} /> : <Block />}
            </Block>
          );
        })}
    </View>
  );
};
export default memo(CircleIdCard);
