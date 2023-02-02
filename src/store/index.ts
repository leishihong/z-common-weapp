import dva from './dva';

const files: any = require.context('./modules/', true, /\.ts$/);
const globalsModuleFiles = require.context('../', true, /\module.ts$/);

const modules = {};

files.keys().forEach((key) => {
  modules[key] = files(key).default || files(key);
});

globalsModuleFiles.keys().forEach((key) => {
  modules[key] = globalsModuleFiles(key).default || globalsModuleFiles(key);
});

const dvaApp = dva.createApp({
  initialState: {},
  models: Object.values(modules),
  onAction: {},
  enableLog: process.env.WE_APP_ENV === 'dev',
  onError: () => {},
  onReducer: (reducer) => (state, action) => {
    // console.log(action, 'action==dva===处理一键清除dva数据');
    const newState = reducer(state, action);
    if (action.type === 'globalsState/clearAppStore') {
      return reducer({}, action);
    }
    return newState;
  }
});

const store = dvaApp.getStore();

export default store;
