import { FC, PropsWithChildren } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Provider } from 'react-redux';

import store from 'store/index';
import { handleUpdate } from 'utils/taroUpdateManager';

import './app.scss';

const App: FC<PropsWithChildren> = ({ children }) => {
	useDidShow(() => {
		handleUpdate();
	});
	Taro.onPageNotFound((options) => {
		console.log('on page not found', options);
		Taro.redirectTo({
			url: URL['404']
		});
	});

	return <Provider store={store}>{children}</Provider>;
};

export default App;
