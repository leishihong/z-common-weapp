'use strict';

module.exports = {
  types: [
    { value: '🎉 init', name: '🎉init:  项目初始化' },
    { value: '✨ feat', name: '✨feat:     新功能' },
    { value: '🐛 fix', name: '🐛fix:      修复' },
    { value: '📝 docs', name: '📝docs:     文档变更' },
    { value: '💄 style', name: '💄style:    代码格式(不影响代码运行的变动)' },
    {
      value: '💡 refactor',
      name: '💡refactor: 重构(既不是增加feature，也不是修复bug)'
    },
    { value: '⚡️ perf', name: '⚡️perf:     性能优化' },
    { value: '✅ test', name: '✅test:     增加测试' },
    { value: '👷 ci', name: '👷ci:       修改了 CI 配置、脚本' },
    { value: '🚀c hore', name: '🚀chore:    构建过程或辅助工具的变动' },
    { value: '⏪ revert', name: '⏪revert:   代码回退' },
    { value: '📦‍ build', name: '📦‍build:    打包' }
    // { value: 'wip', name: 'wip:    正在进行的工作' }
  ],
  // override the messages, defaults are as follows
  messages: {
    type: '请确保你的提交遵循了原子提交规范！\n请选择提交类型:',
    scope: '\n请选择一个scope范围(可选):',
    // used if allowCustomScopes is true
    customScope: '请输入文件修改范围(可选):',
    subject: '请简要描述提交(必填):',
    body: '请输入详细描述(可选，待优化去除，跳过即可)使用 ' | ' 换行:\n',
    breaking: '列举非兼容性重大的变更 (可选):\n',
    footer: '请输入要关闭的issue，例如：#1, #2(可选):',
    confirmCommit: '确认使用以上信息提交？(y/n/e/h)'
  },
  allowCustomScopes: true,
  //跳过问题
  skipQuestions: ['body', 'footer'],
  // allowBreakingChanges: ['feat', 'fix'],
  subjectLimit: 100
};
