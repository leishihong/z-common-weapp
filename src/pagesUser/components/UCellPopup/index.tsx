import { FC, memo, Suspense, lazy, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Picker,
  PickerView,
  PickerViewColumn,
  Block,
  Textarea,
  Input,
  Label,
  ScrollView
} from '@tarojs/components';
import dayjs from 'dayjs';
import Taro from '@tarojs/taro';
import cls from 'classnames';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { useSelector, useDispatch } from 'react-redux';
import trim from 'lodash/trim';
import { UCell, Avatar } from 'components/index';
import { realAgeFunc } from 'utils/index';
import TagsSkills, { TagSkillsItem } from 'components/TagsSkills';
import cx from './index.module.scss';

const Popup = lazy(() => import('components/Popup'));

type IPopType = 'input' | 'textarea' | 'TagsSkills';

/** 普通选择器 selector */
/** 多列选择器 multiSelector */
/** 时间选择器 time */
/** 日期选择器 date */
/** 省市区选择器 region*/

interface IProps {
  title: unknown;
  mode?: 'selector' | 'multiSelector' | 'time' | 'date' | ('region' & any);
  value?: any;
  bordered?: boolean;
  placeholder?: string;
  dataSource?: any;
  pickerTitle?: string;
  fieldType?: string;
  closeable?: boolean;
  maxlength?: number;
  onConfirm?: (valueInfo: any) => void;
}

const UCellPopup: FC<IProps> = (props) => {
  const { title, value, pickerTitle, placeholder, bordered, dataSource, mode, fieldType, maxlength, onConfirm } = props;
  const { system } = useSelector(({ globalsState }) => globalsState);

  const [popUpVisible, setPopUpVisible] = useState<boolean>(false);
  const [cellInfo, setCellInfo] = useState<any>({
    cellLabel: value,
    cellValue: value,
    pickerValue: value,
    cellItem: {}
  });
  const pickerFormRef: any = useRef(cellInfo);

  useEffect(() => {
    if (value !== null && value !== undefined) {
      setCellInfo((preState) => {
        let CELL_INFO = { cellLabel: value, cellValue: value, pickerValue: value, cellItem: {} };
        if (mode === 'selector') {
          const findInd = dataSource?.findIndex((item) => (fieldType === 'sex' ? item.dicCode : item.dicValue) == value);
          if (findInd > -1) {
            const findItem = dataSource[findInd];
            console.log(findInd, findItem, 'useEffect');
            CELL_INFO = Object.assign({}, CELL_INFO, {
              cellLabel: findItem.dicValue,
              cellValue: findItem.docCode,
              pickerValue: findInd
            });
          }
        } else if (mode === 'date') {
          CELL_INFO = Object.assign({}, CELL_INFO, {
            cellLabel: value ? `${realAgeFunc(value)}岁` : '',
            cellValue: dayjs(value).format('YYYY-MM-DD'),
            pickerValue: dayjs(value).format('YYYY-MM-DD')
          });
        }
        if (mode === 'region' && isEmpty(value)) {
          CELL_INFO = { cellLabel: '', cellValue: [], pickerValue: [], cellItem: {} };
        }
        if (fieldType === 'TagsSkills' && Array.isArray(value) && !isEmpty(dataSource)) {
          const mapLabelIds = value || [];
          const mapLabelNames = dataSource
            .filter((item) => mapLabelIds.includes(item.labelId))
            ?.map((item) => item.labelName);
          CELL_INFO = Object.assign({}, CELL_INFO, {
            cellLabel: mapLabelNames?.join('、'),
            cellValue: mapLabelIds,
            pickerValue: mapLabelIds
          });
          console.log(CELL_INFO, 'CELL_INFO---TagsSkills');
        }
        pickerFormRef.current = Object.assign({}, preState, CELL_INFO);
        return Object.assign({}, preState, CELL_INFO);
      });
      // handleConfirm();
    }
  }, [value, dataSource, mode, fieldType]);

  const [fieldInfo, setFieldInfo] = useState<any>({ inputMarBot: null, inputHeight: null, isFocused: false });

  const handleClickPress = useCallback(() => {
    setPopUpVisible(true);
  }, []);

  const handleCancel = useCallback(() => {
    setPopUpVisible(false);
    setFieldInfo({ inputMarBot: false, inputHeight: 0, isFocused: false });
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm?.({ cellInfo: pickerFormRef.current, valueKey: props['data-valueKey'], callback: () => handleCancel() });
  }, [pickerFormRef.current, props['data-valueKey']]);

  const handlePickerChange = useCallback(
    ({ detail }) => {
      const pickerValue = detail.value;
      switch (mode) {
        case 'date':
          //获取当前时间
          const birthday = realAgeFunc(pickerValue);
          if (birthday < 0) {
            Taro.showToast({ title: '年龄有误，请重新选择', icon: 'none' });
            return;
          }
          pickerFormRef.current = {
            cellLabel: `${birthday}岁`,
            cellValue: pickerValue,
            pickerValue: pickerValue,
            cellItem: { cellLabel: birthday, cellValue: pickerValue, pickerValue: pickerValue }
          };
          setCellInfo(pickerFormRef.current);
          setTimeout(() => {
            handleConfirm();
          }, 300);
          break;
        case 'selector':
          const findInd = dataSource.findIndex((_, index) => index == pickerValue);
          const findItem = dataSource[findInd];
          console.log(findItem, 'findItem');
          pickerFormRef.current = {
            cellLabel: findItem.dicValue,
            cellValue: findItem.dicValue,
            pickerValue: findInd,
            cellItem: { cellLabel: findItem.dicValue, cellValue: findItem.dicCode, pickerValue: findInd }
          };
          setCellInfo(pickerFormRef.current);
          setTimeout(() => {
            handleConfirm();
          }, 300);
          break;
        case 'region':
          const regionCode = detail.code;
          if (regionCode.length !== 3) {
            Taro.showToast({ title: '请选择完整的地址哦', icon: 'none' });
            return;
          }
          pickerFormRef.current = {
            cellLabel: pickerValue,
            cellValue: pickerValue,
            pickerValue: regionCode,
            cellItem: {}
          };
          setCellInfo(pickerFormRef.current);
          setTimeout(() => {
            handleConfirm();
          }, 300);
          break;
        default:
          break;
      }
    },
    [dataSource, mode]
  );

  const handleFieldChange = useCallback(
    ({ detail }) => {
      const targetValue = trim(detail.value);
      const isFocused = !isEmpty(String(targetValue));
      setFieldInfo((preState) => {
        return { ...preState, isFocused };
      });
      pickerFormRef.current = { pickerValue: targetValue, cellValue: targetValue, cellLabel: value };
      setCellInfo(pickerFormRef.current);
    },
    [value]
  );
  const handleClear = useCallback(() => {
    pickerFormRef.current = { pickerValue: '', cellValue: '', cellLabel: value };
    setCellInfo(pickerFormRef.current);
    setFieldInfo((preState) => {
      return { ...preState, isFocused: false };
    });
  }, [value]);
  // input和textarea 获取焦点页面异常设置
  const handleFocus = useCallback(
    (e) => {
      let inputHeight = 0;
      if (e && e.detail.height) {
        inputHeight = system.ios ? e.detail.height - 38 : e.detail.height;
      }
      setFieldInfo({ inputMarBot: true, inputHeight, isFocused: !isEmpty(String(cellInfo.pickerValue)) });
    },
    [system.ios, cellInfo.pickerValue]
  );
  const handleBlur = useCallback(() => {
    setFieldInfo(() => {
      return { inputMarBot: false, inputHeight: 0, isFocused: false };
    });
  }, []);
  const handleSkillChange = (rowItem: any) => {
    const { pickerValue = [] } = pickerFormRef.current;
    const labelIds: any = [...pickerValue];
    if (!labelIds.includes(rowItem.labelId)) {
      labelIds.push(rowItem.labelId);
    } else {
      const findInd = labelIds.findIndex((item) => item == rowItem.labelId);
      if (findInd > -1) {
        labelIds.splice(findInd, 1);
      }
    }
    pickerFormRef.current = {
      cellValue: labelIds,
      pickerValue: labelIds,
      cellItem: {}
    };
    setCellInfo(pickerFormRef.current);
  };
  const renderUCell = useMemo(() => {
    if (mode) {
      return (
        <Picker
          mode={mode}
          value={cellInfo.pickerValue}
          range={dataSource}
          rangeKey={(['selector', 'multiSelector'].includes(mode) && 'dicValue') || ''}
          customItem='请选择'
          onChange={handlePickerChange}
        >
          <UCell title={title} placeholder={placeholder} bordered={bordered} value={cellInfo.cellLabel} />
        </Picker>
      );
    }
    return (
      <UCell
        title={title}
        placeholder={placeholder}
        bordered={bordered}
        value={cellInfo.cellLabel}
        onClickPress={handleClickPress}
      />
    );
  }, [mode, title, dataSource, value, placeholder, cellInfo.pickerValue, cellInfo.cellLabel]);

  return (
    <Block>
      {renderUCell}
      <Suspense fallback={null}>
        <Popup
          placement='bottom'
          rounded
          closeable
          title={pickerTitle}
          visible={popUpVisible}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          style={{ bottom: `${fieldInfo.inputMarBot ? fieldInfo.inputHeight : ''}px` }}
          footer={
            <View className={cx['pop-footer-btn']} onClick={handleConfirm}>
              确定
            </View>
          }
        >
          <Block>
            {fieldType === 'TagsSkills' && (
              <ScrollView scrollY style={{ height: 200 }}>
                <TagsSkills
                  dataSource={dataSource}
                  skillsChecked={cellInfo.pickerValue}
                  renderItem={(item) => (
                    <TagSkillsItem
                      rowItem={item}
                      skillsActive={cellInfo.pickerValue.includes(item.labelId)}
                      valueLabel='labelName'
                      valueKey='labelId'
                      onClick={() => handleSkillChange(item)}
                    />
                  )}
                />
              </ScrollView>
            )}
            <View
              style={{ display: fieldType && ['input', 'textarea'].includes(fieldType) ? 'block' : 'none' }}
              className={cx['field-group']}
            >
              {fieldType === 'input' && (
                <View className={cx['field-wrap']}>
                  <View className={cx['field-input-inner']}>
                    <Input
                      className={cx['field-input']}
                      type={props['data-valueKey'] === 'nickName' ? 'nickname' : 'text'}
                      value={cellInfo.pickerValue}
                      onInput={handleFieldChange}
                      placeholder={placeholder}
                      adjustPosition={false}
                      // cursorSpacing={120}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      maxlength={200}
                      placeholderStyle='color:#999999;font-size:28rpx;font-family: PingFang SC-Regular, PingFang SC;'
                    />
                    <View className={cx['field-input-close']}>
                      {cellInfo.pickerValue && fieldInfo.isFocused && (
                        <Avatar
                          src='https://s4.ax1x.com/2021/12/25/Tajnht.png'
                          shape='square'
                          size={36}
                          onAvatar={handleClear}
                        />
                      )}
                    </View>
                  </View>
                </View>
              )}
              {fieldType === 'textarea' && (
                <View className={cx['field-wrap']}>
                  <View className={cx['field-input-inner']} style='padding-bottom:0px;'>
                    <Textarea
                      value={cellInfo.pickerValue}
                      placeholder={placeholder}
                      className={cx['field-input']}
                      placeholderStyle='color:#999999;font-size:28rpx;font-family: PingFang SC-Regular, PingFang SC;'
                      autoHeight
                      showConfirmBar={false}
                      adjustPosition={false}
                      maxlength={maxlength}
                      style='min-height:80px'
                      // cursorSpacing={120}
                      onFocus={handleFocus}
                      onInput={handleFieldChange}
                      onBlur={handleBlur}
                    />
                    <View className={cx['field-input-close']}>
                      {cellInfo.pickerValue && fieldInfo.isFocused && (
                        <Avatar
                          src='https://s4.ax1x.com/2021/12/25/Tajnht.png'
                          shape='square'
                          size={36}
                          onAvatar={handleClear}
                        />
                      )}
                    </View>
                  </View>
                  <View className={cx['field-word-limit']}>
                    <Text>{cellInfo.pickerValue?.length}</Text>/{maxlength}
                  </View>
                </View>
              )}
            </View>
          </Block>
        </Popup>
      </Suspense>
    </Block>
  );
};

UCellPopup.defaultProps = {
  bordered: true,
  dataSource: [],
  placeholder: '',
  title: '',
  value: '',
  closeable: false,
  maxlength: 200
};

export default memo(UCellPopup);
