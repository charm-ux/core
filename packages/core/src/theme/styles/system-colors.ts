import { css } from 'lit';

/**
 * Convenient object for grabbing system colors for forced-colors / high contrast mode.
 * They are all wrapped the css`` helper to make them easier to use in lit components.
 *
 * https://lit.dev/docs/components/styles/#expressions
 * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#system_colors
 */
export const SystemColors = {
  ActiveText: css`ActiveText`,
  ButtonBorder: css`ButtonBorder`,
  ButtonFace: css`ButtonFace`,
  ButtonText: css`ButtonText`,
  Canvas: css`Canvas`,
  CanvasText: css`CanvasText`,
  Field: css`Field`,
  FieldText: css`FieldText`,
  GrayText: css`GrayText`,
  Highlight: css`Highlight`,
  HighlightText: css`HighlightText`,
  LinkText: css`LinkText`,
  Mark: css`Mark`,
  MarkText: css`MarkText`,
  VisitedText: css`VisitedText`,
};
