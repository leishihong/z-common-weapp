import { FC, memo, useCallback, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import { View, Block } from '@tarojs/components';
import cls from 'classnames';
import Taro, { useReady, useRouter } from '@tarojs/taro';
import { useSelector, useDispatch } from 'react-redux';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import flattenDeep from 'lodash/flattenDeep';
import compact from 'lodash/compact';
import { TAB } from 'constants/router';

import { UCellGroup, URange, EmptyPage } from 'components/index';
import useForceUpdate from 'hooks/useForceUpdate';
import { getStringifyUrl } from 'utils/utils';
import { fetchQueryCircleLabelList, fetchQueryLabelTypeList } from 'api/user-info';
import TagsSkills, { TagSkillsItem } from 'components/TagsSkills';

import cx from './index.module.scss';

const ModifyCircleTagSkills: FC = () => {
  const dispatch = useDispatch();
  const { modifyState, mineState, loading } = useSelector(({ modifyState, mineState, loading }) => ({
    modifyState,
    mineState,
    loading
  }));
  const { circleInfo = [] } = useMemo(() => mineState, [mineState]);
  const router: any = useRouter();
  const { query }: any = useMemo(() => getStringifyUrl(router.$taroPath), [getStringifyUrl(router.$taroPath)]);
  const { circleName, circleId } = query;

  const rangeTips = useRef<number>(9);
  const forceUpdate = useForceUpdate();
  const [circleLabel, setCircleLabel] = useState(Object);
  const [personalityLabels, setPersonalityLabels] = useState([]);
  const [skillsLabels, setSkillsLabels] = useState([]);
  const [labelType, setLabelType] = useState();
  const [labelId, setLabelId] = useState<any>([]);
  const [initLoading, setInitLoading] = useState<boolean>(true);
  const [isNetWork, setIsNetWork] = useState<boolean>(false);

  useReady(() => {
    Taro.nextTick(() => {
      Taro.setNavigationBarTitle({ title: circleName });
    });
  });

  useEffect(() => {
    queryCircleLabelList();
  }, [circleId, circleName]);

  useEffect(() => {
    if (!isEmpty(circleInfo)) {
      const {
        circleAge,
        personalityLabels: personality,
        skillsLabels: skills
      } = circleInfo.find((item) => item.circleId == circleId) ?? {};
      rangeTips.current = circleAge;
      setLabelId(() => {
        const results = compact(flattenDeep([personality, skills]));
        const ids = results.map((item) => item.labelId);
        return [...new Set(ids)];
      });
    }
  }, [circleInfo]);

  const queryCircleLabelList = async () => {
    try {
      if (initLoading) Taro.showLoading();
      const { data = [], status } = await fetchQueryCircleLabelList({ circleId, circleName });
      if (status === 200) {
        const { personalityLabels = [], skillsLabels = [] } = !isEmpty(data) && Array.isArray(data) ? data?.[0] : {};
        setPersonalityLabels(personalityLabels);
        setSkillsLabels(skillsLabels);
      } else {
        setIsNetWork(true);
      }
    } catch (error) {
      setIsNetWork(true);
    } finally {
      setInitLoading(false);
      Taro.hideLoading();
    }
  };

  const handleTagChange = useCallback(
    (rowItem) => {
      const labelIds = [...labelId];
      if (!labelIds.includes(rowItem.labelId)) {
        labelIds.push(rowItem.labelId);
      } else {
        const findInd = labelIds.findIndex((item) => item == rowItem.labelId);
        if (findInd > -1) {
          labelIds.splice(findInd, 1);
        }
      }
      setLabelId(labelIds);
    },
    [labelId]
  );
  const handleConfirm = useCallback(() => {
    dispatch({
      type: 'userState/updateUserInfo',
      payload: { circleLabels: [{ circleAge: rangeTips.current, circleId, labelId }] },
      callback: () => {
        Taro.showToast({ title: '更新成功', icon: 'none' });
        Taro.switchTab({ url: TAB['mine'] });
        // dispatch({ type: 'mineState/queryMineUserInfo' });
      }
    });
  }, [circleId, labelId]);

  if (initLoading) return <Block />;

  if (isNetWork) {
    return (
      <EmptyPage
        showButton
        showBackBtn
        onReload={() => {
          setIsNetWork(false);
          setInitLoading(true);
          queryCircleLabelList();
        }}
      />
    );
  }
  return (
    <View className={cx['circle-skills-page']}>
      <View className={cx['circle-skills-card']}>
        <UCellGroup title='圈龄'>
          <View className={cx['circle-age']}>
            <URange
              modelValue={rangeTips.current}
              max={20}
              min={0}
              customBtnStyle={{ backgroundColor: '#f03b56' }}
              inactiveColor='#F7F8FA'
              activeColor='#F03B56'
              buttonColor='#F03B56'
              onChange={(value: number) => {
                rangeTips.current = value;
              }}
            />
          </View>
        </UCellGroup>
        <UCellGroup title='技能'>
          <TagsSkills
            dataSource={skillsLabels}
            renderItem={(rowItem) => (
              <TagSkillsItem
                rowItem={rowItem}
                valueKey='labelId'
                valueLabel='labelName'
                skillsActive={labelId.includes(rowItem.labelId)}
                data-row-item={rowItem}
                onClick={() => handleTagChange(rowItem)}
              />
            )}
          />
        </UCellGroup>
        <UCellGroup title='个性'>
          <TagsSkills
            dataSource={personalityLabels}
            renderItem={(rowItem) => (
              <TagSkillsItem
                rowItem={rowItem}
                valueKey='labelId'
                valueLabel='labelName'
                skillsActive={labelId.includes(rowItem.labelId)}
                data-row-item={rowItem}
                onClick={() => handleTagChange(rowItem)}
              />
            )}
          />
        </UCellGroup>
      </View>
      <View className={cls(cx['footer-wrap'], 'safe-area-inset-bottom')}>
        <View className={cx['footer-btn']} onClick={handleConfirm}>
          确定
        </View>
      </View>
    </View>
  );
};

export default memo(ModifyCircleTagSkills);
