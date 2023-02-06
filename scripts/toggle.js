/**
 * 切换小程序环境
 * 当启动的项目，从命令中接收参数，并替换project.config.json中appid的值
 */
const fs = require('fs');
const path = require('path');

// 获取运行小程序环境
const param = process.argv[2] || 'weapp-prod';

// 小程序环境的APPID配置
const WEAPPS = {
  'weapp-dev': '',
  'weapp-sandbox': '',
  'weapp-staging': '',
  'weapp-prod': ''
};

// 获取当前小程序配置
const current = WEAPPS[param];

// 替换project.config.js文件的appid
const project = './project.config.json';
const projectBuffer = fs.readFileSync(project);
const projectString = projectBuffer.toString();
const projectReg = /"appid":\s".*?"/;
const projectResult = projectString.replace(projectReg, `"appid": "${current}"`);
// console.log(projectResult);
fs.writeFileSync(project, projectResult);

// 替换dev.js文件的appid
const dev = WEAPPS[param] === 'weapp-dev' ? './config/dev.js' : './config/prod.js';
const devBuffer = fs.readFileSync(dev);
const devString = devBuffer.toString();
const devReg = /WEAPP_NO: '.*?'/;
const devResult = devString.replace(devReg, `WEAPP_NO: '${param}'`);
// console.log(devResult);
fs.writeFileSync(dev, devResult);
