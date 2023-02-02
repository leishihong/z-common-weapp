import Taro from '@tarojs/taro';

/**
 * 小程序实时日志上报
 */
const logger = Taro.getRealtimeLogManager ? Taro.getRealtimeLogManager() : null;

export default {
	info() {
		if (!logger) return;
		// console.log('logger ...arguments =>', ...arguments);
		logger.info.apply(logger, arguments);
	},
	warn() {
		if (!logger) return;
		logger.warn.apply(logger, arguments);
	},
	error(_str = '', _obj = {}) {
		if (!logger) return;
		console.log('logger ...arguments =>', ...arguments);
		logger.error.apply(logger, arguments);
	},
	// 从基础库2.7.3开始支持
	// 过滤关键字，最多不超过1kb，可以在小程序管理后台根据设置的内容搜索得到对应的日志。
	setFilterMsg(msg) {
		if (!logger || !logger.setFilterMsg) return;
		if (typeof msg !== 'string') return;
		logger.setFilterMsg(msg);
	},
	// 从基础库2.8.1开始支持
	// 是setFilterMsg的添加接口。用于设置多个过滤关键字。
	addFilterMsg(msg) {
		if (!logger || !logger.addFilterMsg) return;
		if (typeof msg !== 'string') return;
		logger.addFilterMsg(msg);
	}
};
