import React from 'react';
import { Button, Cell } from '@nutui/nutui-react-taro';
import cx from './index.module.scss';

const Index = () => {
  return (
    <div className={cx['nutui-react-demo']}>
      <div className={cx['index']}>欢迎使用 NutUI React 开发 Taro 多端项目。</div>
      <div className={cx['index']}>
        <Button type="primary" className={cx['btn']}>
          NutUI React Button
        </Button>
      </div>
    </div>
  );
};

export default Index;
