// 引入SDK核心类
import gcoord from 'gcoord';
// import QQMapWX from 'libs/qqmap-wx-jssdk.min.js'
const QQMapWX = require('libs/qqmap-wx-jssdk.min.js');

// 实例化API核心类
const qqmapsdk = new QQMapWX({ key: LOCATION_API_KEY });

/**
 *
 * @param location
 * @param coordType 1GPS, 2sogou, 3baidu, 4mapbar, 5腾讯谷歌高德 6sougou墨卡托
 */
export const getLocation = (location = {}, coordType = 5) => {
  return new Promise((resolve, reject) => {
    qqmapsdk.reverseGeocoder({
      location,
      coord_type: coordType,
      success(res) {
        resolve(res);
      },
      fail(e) {
        reject(e);
      }
    });
  });
};

/**
 *
 * @param location 转换坐标
 * 百度地图坐标=>腾讯地图坐标
 */
export const transform = (location) => {
  console.error('TCL: transform1 -> location', location);
  return gcoord.transform(
    [location.longitude * 1, location.latitude * 1], // 经纬度坐标
    gcoord.BD09, // 当前坐标系
    gcoord.GCJ02 // 目标坐标系
  );
};
/**
 *
 * @param location 转换坐标
 * 腾讯地图坐标=>百度地图坐标
 */
export const transformBG = (location) => {
  console.error('TCL: transformBG -> location', location);
  return gcoord.transform(
    [location.longitude * 1, location.latitude * 1], // 经纬度坐标
    gcoord.GCJ02, // 当前坐标系
    gcoord.BD09 // 目标坐标系
  );
};
