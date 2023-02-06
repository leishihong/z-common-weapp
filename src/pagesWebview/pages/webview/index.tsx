import React, { FC, memo, useState, useEffect, useLayoutEffect } from 'react';
import { WebView, View } from '@tarojs/components';
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro';
import { useSelector, useDispatch } from 'react-redux';
import { parse } from 'query-string';
import { parseQuery, jumpSetCallback, getStringifyUrl, stringifyQuery } from 'utils/utils';
import { URL, TAB } from 'constants/router';
import { shareAppMessage } from 'utils/shareAppMessage';

import cx from './index.module.scss';

const ZWebview: FC = () => {
  const { webviewUrl } = useSelector(({ globalsState }) => globalsState);
  const [shareMessageInfo, setShareMessageInfo] = useState<Object>();
  const { url, query } = getStringifyUrl(webviewUrl);
  const pathname = url.split('/').pop();
  const router: any = useRouter();
  console.log(router, pathname, query, 'pathname');

  Taro.showShareMenu({
    withShareTicket: true,
    showShareItems: ['voteDetail'].includes(pathname) ? ['shareAppMessage', 'shareTimeline'] : []
  });

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: '载入中,请稍后...' });
    Taro.showNavigationBarLoading();
  }, []);
  useShareAppMessage((payload) => {
    const { webViewUrl, from, target }: any = payload;
    const [origin, search] = webViewUrl?.split('?');
    const searchParams = parse(`?${search}`);
    delete searchParams.X_AUTH_TOKEN;
    delete searchParams.weappQuery;

    console.log(webViewUrl, 'webViewUrl', origin, searchParams);
    console.log(payload, 'options');

    const shareInfo = shareAppMessage();
    // 来自页面内的按钮的转发
    if (from == 'button') {
      const data = target.dataset;
      console.log(data, 'data');
    } else if (from == 'menu') {
      shareInfo.path =
        URL['land'] +
        `?returnUrl=${origin}` +
        stringifyQuery({ ...searchParams, needLogin: true, formType: 'h5' }, '?');
    }
    console.log(shareInfo, 'shareInfo');
    return shareInfo;
  });

  const onMessage = async (e: any) => {
    console.log('TCL: Webview -> handleMessage -> e', e);
    // TODO: 此处只取第一个task任务
    const taskList = e.detail.data;
    const task = taskList.pop();
    // console.error("TCL: Webview -> handleMessage -> task", task)
    // 解析URL地址的参数
    if (task.callback) {
      const tmp: any = parseQuery(task.callback.url);
      // 融合传递过来的参数
      const query = { ...tmp.query, ...task.callback.query };
      // 回调跳转是否保存历史记录
      const webviewType = task.callback.webviewType || 'page';
      console.log(query, webviewType);
      // 设置回调地址
      jumpSetCallback({
        url: task.callback.url || tmp.url,
        query,
        type: task.callback.type,
        from: 'h5',
        webviewType
      });
    }
  };
  const handleLoad = (e) => {
    Taro.hideNavigationBarLoading();
    console.log('TCL: Webview -> handleLoad -> e', e);
  };
  const handleError = (e) => {
    Taro.hideNavigationBarLoading();
    Taro.showToast({ title: '页面加载失败，请重新进入', duration: 500 });
    console.log('TCL: Webview -> handleError -> e', e);
  };
  // 安卓机上web-view内嵌页面白屏的bug https://www.jianshu.com/p/52ec518562fa
  return (
    <View className={cx['webview-page']}>
      <WebView src={webviewUrl} onMessage={onMessage} onLoad={handleLoad} onError={handleError} />
    </View>
  );
};

export default memo(ZWebview);
