import { css } from 'lit';
import { tokens } from '../../utilities/theme.js';

const { component } = tokens.lit;

export default css`
  .base {
    align-items: flex-start;
    cursor: default;
    display: flex;
    flex-direction: column;
    padding: ${component('menu', 'groupHeadingPaddingY')} ${component('menu', 'groupHeadingPaddingX')};
  }

  .heading {
    width: 100%;
    text-align: start;
  }

  .heading,
  ::slotted([slot='heading']) {
    font-size: ${component('menu', 'groupHeadingSize')};
    font-weight: ${component('menu', 'groupHeadingWeight')};
    padding: ${component('menu', 'groupHeadingPaddingY')} ${component('menu', 'groupHeadingPaddingX')};
    line-height: ${component('menu', 'groupHeadingLineHeight')};
    margin: ${component('menu', 'groupHeadingMargin')};
  }

  ::slotted(menu-item) {
    width: 100%;
  }
`;
