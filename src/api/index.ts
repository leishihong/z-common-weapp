import { post } from 'utils/request';

// 小程序登录
export const fetchVxAppletsLogin = (params): Promise<any> => post('user/vxAppletsLogin', params);
// 获取验证码
export const fetchVerifyCode = (params): Promise<any> => post('user/sendMsgCode', params);
// 新用户注册接口
export const fetchUserLogin = (params): Promise<any> => post('user/registerOrLogin', params);
// 获取用户手机号
export const fetchVxAppletsMobile = (params): Promise<any> => post('user/vxAppletsMobile', params);
