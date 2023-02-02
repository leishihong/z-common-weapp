import Taro from '@tarojs/taro';

//TODO: 小程序上新更新提醒
export const handleUpdate = (updateType?: string) => {
  if (Taro.canIUse('getUpdateManager')) {
    //判断目前微信版本是否支持自动更新
    const updateManager = Taro.getUpdateManager();
    updateManager.onCheckForUpdate(function (checkRes) {
      console.log(checkRes.hasUpdate, 'onCheckForUpdate');
      //检测是否有新版本
      if (checkRes.hasUpdate) {
        updateManager.onUpdateReady(function () {
          Taro.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启 应用新版本并重启，如果想静默更新，直接在检测有新版本的时候调用此方法即可
                updateManager.applyUpdate();
              } else if (res.cancel) {
                // 用户点击取消,为了不骚扰用户，存储到store中
              }
            }
          });
        });
        //如果自动更新失败，给用户提示手动更新（有些小程序涉及到多ID使用，不更新会出现莫名的缓存bug，大部分小程序不用执行这一步）
        updateManager.onUpdateFailed(function () {
          // 调用后台接口，获取提示语和升级方式
          Taro.showModal({
            title: '检测到新版本',
            content: '新版本已经上线啦，请您删除当前小程序，重新打开'
          });
        });
        return;
      }
      if (updateType === 'check-manual-update') return Taro.showToast({ title: '当前已经是最新版本哦~', icon: 'none' });
    });
  } else {
    Taro.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    });
  }
};
