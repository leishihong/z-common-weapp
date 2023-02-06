const defaultImageUrl = 'https://img.mtaste.cn/prod/img/system/config/749fd28fd9f646f1a4128c44006c9ec5.png';
const defaultTitle = '光年之外，热爱至上，欢迎着陆～';
const defaultPath = '/pages/land/index';

export const shareAppMessage = (options: any = {}) => {
  console.log(`output->shareAppMessage`, options);
  // 'https://img.mtaste.cn/prod/img/1.jpg'
  return {
    title: options?.title || defaultTitle, // 分享出去的标题
    path: options?.path || defaultPath, // 分享出去的页面，必须是以‘/’开头的完整路径
    imageUrl: options?.imageUrl || defaultImageUrl // 分享出去的图片地址
  };
};

export const shareTimeline = (options: any = {}) => {
  console.log(`output->shareTimeline`, options);
  return {
    title: options?.title || defaultTitle,
    query: options?.query,
    imageUrl: options?.imageUrl || defaultImageUrl
  };
};
