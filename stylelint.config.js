// stylelint rule https://stylelint.io/user-guide/rules/selector-max-attribute
// https://cloud.tencent.com/developer/section/1489630

module.exports = {
  customSyntax: 'postcss-html',
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  rules: {
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'no-duplicate-selectors': null,
    'color-function-notation': null,
    'font-family-no-missing-generic-family-keyword': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global']
      }
    ]
  }
};
