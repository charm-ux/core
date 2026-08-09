import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  .base {
    align-items: flex-start;
    cursor: default;
    display: flex;
    flex-direction: column;
    padding: ${component('menu', 'groupHeadingPaddingY')} ${component('menu', 'groupHeadingPaddingX')};
  }

  .heading {
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

  .group-content {
    width: 100%;
  }
`;
