const reg = /^1((3[0-9]|4[57]|5[0-35-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{8}$)/;
const matchingReg = /^1\d{10}$/;
// 检验手机号码
export const checkPhone = (val) => {
  return matchingReg.test(val);
};
// 检验测试手机号码
export const checkTestPhone = (val) => {
  return /^[0-9]{11}$/.test(val);
};
// 检验手机号码
export const cut = (str, num = 5) => {
  str = str.trim();
  if (str.length > num) {
    str = str.slice(0, num) + '...';
  }
  return str;
};
// 检验验证码
export const checkCode = (val) => {
  return /^\d{6}$/.test(val);
};

// 手机号正则
export const patternTelephone = (value, cb) => {
  if (reg.test(value)) {
    cb();
  } else {
    cb('请输入有效的电话号码');
  }
};
// 银行卡号正则
export const bankCode = (value, cb) => {
  const backReg = /^([1-9]{1})(\d{14}|\d{15}|\d{18})$/;
  if (backReg.test(value)) {
    cb();
  } else {
    cb('请输入正确的银行卡账号');
  }
};
// 密码正则
export const password = (value, cb) => {
  const pwdReg = /^[A-Za-z0-9]{6,12}$/;
  if (pwdReg.test(value)) {
    cb();
  } else {
    cb('请输入正确的密码格式');
  }
};
// 邮箱正则
export const isEmail = (value, cb) => {
  /* eslint-disable */
  const emailReg =
    /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
  if (emailReg.test(value)) {
    cb();
  } else {
    cb('请输入正确的邮箱');
  }
};
// 身份证正则
export const isIdCard = (value, cb) => {
  const cardReg =
    /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
  if (cardReg.test(value)) {
    cb();
  } else {
    cb('请输入正确的身份证');
  }
};
//  身份证校验
export const IDcardRegExp = (id) => {
  const format =
    /^(([1][1-5])|([2][1-3])|([3][1-7])|([4][1-6])|([5][0-4])|([6][1-5])|([7][1])|([8][1-2]))\d{4}(([1][9]\d{2})|([2]\d{3}))(([0][1-9])|([1][0-2]))(([0][1-9])|([1-2][0-9])|([3][0-1]))\d{3}[0-9xX]$/;
  // 号码规则校验
  if (!format.test(id)) {
    return { status: false, msg: '身份证号码不合规' };
  }
  // 区位码校验
  // 出生年月日校验  前正则限制起始年份为1920;
  const year = id.substr(6, 4); // 身份证年
  const month = id.substr(10, 2); // 身份证月
  const date = id.substr(12, 2); // 身份证日
  const time = Date.parse(month + '-' + date + '-' + year); // 身份证日期时间戳date
  const nowTime = Date.parse(new Date().toString()); // 当前时间戳
  const dates = new Date(parseInt(year, 0), parseInt(month, 0), 0).getDate(); // 身份证当月天数
  if (time > nowTime || parseInt(date, 0) > dates) {
    return { status: false, msg: '出生日期不合规' };
  }
  const birth = id.substr(6, 4) + '-' + id.substr(10, 2) + '-' + id.substr(12, 2); // 截取生日字段
  // 校验码判断
  const c = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2); // 系数
  const b = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'); // 校验码对照表
  const idArray = id.split('');
  let sum = 0;
  for (let k = 0; k < 17; k++) {
    sum += parseInt(idArray[k], 0) * c[k];
  }
  if (idArray[17].toUpperCase() !== b[sum % 11].toUpperCase()) {
    return { status: false, msg: '身份证校验码不合规' };
  }
  return { status: true, msg: '校验通过', birth };
};

/**
 * 从身份证中提取生日
 * @param IdNumber 身份证
 */
//
export const getBirthdayByIdNO = (IdNumber) => {
  let birthday = '';
  if (IdNumber.length === 18) {
    birthday = IdNumber.substr(6, 8);
    return birthday.replace(/(.{4})(.{2})/, '$1-$2-');
  } else if (IdNumber.length === 15) {
    birthday = '19' + IdNumber.substr(6, 6);
    return birthday.replace(/(.{4})(.{2})/, '$1-$2-');
  } else {
    return '';
  }
};
// 手机号加密
export const phoneSecret = (phone: any) => {
  const phoneReg = /(\d{3})\d{4}(\d{4})/; // 正则表达式
  const phoneNew = String(phone).replace(phoneReg, '$1****$2');
  return phoneNew;
};
