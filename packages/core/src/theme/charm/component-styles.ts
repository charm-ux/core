import { css } from 'lit';

export const componentStyles = css`
  [accordion] {
    --accordion-top-border-color: inherit;
  }

  [accordion-item] {
    --accordion-item-bottom-border-color: inherit;
  }

  [avatar] {
    --avatar-bg-color: inherit;
    --avatar-size: inherit;
    --avatar-border-radius: inherit;
    --avatar-indicator-bg-color: inherit;
    --avatar-indicator-border-width: inherit;
    --avatar-indicator-border-color: inherit;
    --avatar-indicator-border-radius: inherit;
    --avatar-indicator-color: inherit;
    --avatar-indicator-padding: inherit;
    --avatar-indicator-size: inherit;
  }

  [badge] {
    --badge-bg-color: inherit;
    --badge-border-color: inherit;
    --badge-border-radius: inherit;
    --badge-border-style: inherit;
    --badge-border-width: inherit;
    --badge-fg-color: inherit;
    --badge-padding: inherit;
    --badge-size: inherit;
  }

  [breadcrumb] {
  }

  [breadcrumb-item] {
    --breadcrumb-item-gap: inherit;
    --breadcrumb-item-padding: inherit;
    --breadcrumb-item-control-width: inherit;
    --breadcrumb-item-border-width: inherit;

    /**Rest */
    --breadcrumb-item-bg-color: inherit;
    --breadcrumb-item-border-color: inherit;
    --breadcrumb-item-fg-color: inherit;

    /**Hover */
    --breadcrumb-item-hover-bg-color: inherit;
    --breadcrumb-item-hover-border-color: inherit;
    --breadcrumb-item-hover-fg-color: inherit;

    /**Active */
    --breadcrumb-item-active-bg-color: inherit;
    --breadcrumb-item-active-border-color: inherit;
    --breadcrumb-item-active-fg-color: inherit;

    /**Focus */
    --breadcrumb-item-focus-bg-color: inherit;
    --breadcrumb-item-focus-border-color: inherit;
    --breadcrumb-item-focus-fg-color: inherit;

    /**Disabled */
    --breadcrumb-item-disabled-bg-color: inherit;
    --breadcrumb-item-disabled-border-color: inherit;
    --breadcrumb-item-disabled-fg-color: inherit;
  }

  [button] {
    --button-border-radius: inherit;
    --button-border-size: inherit;
    --button-border-style: inherit;
    --button-content-gap: inherit;
    --button-font-weight: inherit;
    --button-icon-padding-x: inherit;
    --button-icon-padding-y: inherit;
    --button-padding-x: inherit;
    --button-padding-y: inherit;
    --button-icon-size: inherit;

    /** Rest */
    --button-bg-color: inherit;
    --button-border-color: inherit;
    --button-fg-color: inherit;
    --button-link-fg-color: inherit;
    --button-shadow: inherit;

    /* Toggle Button  */
    --button-pressed-bg-color: inherit;
    --button-pressed-border: inherit;
    --button-pressed-fg-color: inherit;

    /** Disabled */
    --button-disabled-bg-color: inherit;
    --button-disabled-border-color: inherit;
    --button-disabled-fg-color: inherit;
    --button-disabled-shadow: inherit;

    /** Hover */
    --button-hover-bg-color: inherit;
    --button-hover-border-color: inherit;
    --button-hover-fg-color: inherit;
    --button-hover-shadow: inherit;
    --button-link-hover-fg-color: inherit;

    /** Focus */
    --button-focus-bg-color: inherit;
    --button-focus-border-color: inherit;
    --button-focus-fg-color: inherit;
    --button-focus-shadow: inherit;
    --button-link-focus-fg-color: inherit;

    /** Active */
    --button-active-bg-color: inherit;
    --button-active-border-color: inherit;
    --button-active-fg-color: inherit;
    --button-active-shadow: inherit;
    --button-link-active-fg-color: inherit;

    /** Button group */
    --button-group-divider-color: inherit;
    --button-group-divider-height: inherit;
    --button-group-divider-width: inherit;
  }

  [button-group] {
    --card-border-style: inherit;
    --card-border-size: inherit;
    --card-border-radius: inherit;
    --card-border-color: inherit;
    --card-content-gap: inherit;
    --card-padding: inherit;

    /** Default */
    --card-bg-color: inherit;
    --card-fg-color: inherit;
    --card-box-shadow: inherit;
  }

  [checkbox] {
    /** Rest */
    --checkbox-bg-color-checked: inherit;
    --checkbox-bg-color-unchecked: inherit;
    --checkbox-border-color-checked: inherit;
    --checkbox-border-radius: inherit;
    --checkbox-fg-color-checked: inherit;
    --checkbox-fg-color: inherit;
    --checkbox-icon-size: inherit;
    --checkbox-size: inherit;

    /** Active */
    --checkbox-active-bg-color-checked: inherit;
    --checkbox-active-bg-color-unchecked: inherit;
    --checkbox-active-border-color-unchecked: inherit;
    --checkbox-active-border-color-checked: inherit;
    --checkbox-active-fg-color: inherit;

    /** Hover */
    --checkbox-hover-bg-color-checked: inherit;
    --checkbox-hover-bg-color-unchecked: inherit;
    --checkbox-hover-border-color-unchecked: inherit;
    --checkbox-hover-border-color-checked: inherit;
    --checkbox-hover-fg-color: inherit;

    /** Disabled */
    --checkbox-disabled-bg-color-checked: inherit;
    --checkbox-disabled-bg-color-unchecked: inherit;
    --checkbox-disabled-border-color: inherit;
    --checkbox-disabled-fg-color: inherit;
  }

  [dialog] {
    --dialog-close-button-bg-color: inherit;
    --dialog-close-button-border-color: inherit;
    --dialog-close-button-border-width: inherit;
    --dialog-close-button-padding: inherit;
    --dialog-close-button-border-radius: inherit;

    /** close button hover */
    --dialog-close-button-hover-bg-color: inherit;
    --dialog-close-button-hover-border-color: inherit;
    --dialog-close-button-hover-fg-color: inherit;

    /** close button active */
    --dialog-close-button-active-bg-color: inherit;
    --dialog-close-button-active-border-color: inherit;
    --dialog-close-button-active-fg-color: inherit;

    /** close button focus */
    --dialog-close-button-focus-bg-color: inherit;
    --dialog-close-button-focus-border-color: inherit;
    --dialog-close-button-focus-fg-color: inherit;

    --dialog-max-height: inherit;
    --dialog-max-width: inherit;
    --dialog-bg-color: inherit;
    --dialog-fg-color: inherit;
    --dialog-border-width: inherit;
    --dialog-border-color: inherit;
    --dialog-border-radius: none;
    --dialog-padding-x: inherit;
    --dialog-padding-y: inherit;
    --dialog-shadow: none;
    --dialog-transition: inherit;
    --dialog-backdrop-color: inherit;
    --dialog-size: inherit;
    --dialog-footer-button-gap: inherit;
    --dialog-toolbar-button-gap: inherit;
    --dialog-header-toolbar-gap: inherit;
    --dialog-margin-top: inherit;
  }

  [disclosure] {
    --disclosure-gap: inherit;
    --disclosure-content-border: inherit;
    --disclosure-content-border-radius: inherit;
    --disclosure-bg-color: inherit;
    --disclosure-fg-color: inherit;
    --disclosure-closed-max-height: inherit;
    --disclosure-opened-max-height: inherit;
    --disclosure-show-transition: inherit;
    --disclosure-hide-transition: inherit;
  }

  [divider] {
    --divider-border: inherit;
    --divider-inset: inherit;
    --divider-text-gap: inherit;
    --divider-text-offset: inherit;
    --divider-vertical-min-height: inherit;
  }

  [input] {
    --input-range-thumb-color: inherit;
    --input-range-progress-color: inherit;
    --input-range-track-color: inherit;

    --input-range-hover-fg-color: inherit;
    --input-range-hover-bg-color: inherit;

    --input-range-active-fg-color: inherit;
    --input-range-active-bg-color: inherit;

    --input-range-disabled-fg-color: inherit;
    --input-range-disabled-bg-color: inherit;
  }

  [menu] {
    --menu-bg-color: inherit;
    --menu-max-width: inherit;
    --menu-min-width: inherit;
    --menu-shadow: inherit;
    --menu-width: inherit;
  }

  [menu-item] {
    --menu-item-border-radius: inherit;
    --menu-item-padding-x: inherit;
    --menu-item-padding-y: inherit;
    --menu-item-submenu-item-icon-size: inherit;
    --menu-item-submenu-top: inherit;
    --menu-item-submenu-left: inherit;
    --menu-item-margin-x: inherit;
    --menu-item-input-container-width: inherit;
    --menu-item-checkbox-icon-size: inherit;

    --menu-item-radio-bg-color: inherit;
    --menu-item-radio-border-color: inherit;
    --menu-item-radio-hover-bg-color: inherit;
    --menu-item-radio-hover-border-color: inherit;
    --menu-item-radio-active-bg-color: inherit;
    --menu-item-radio-active-border-color: inherit;

    /** Rest */
    --menu-item-bg-color: inherit;
    --menu-item-border-color: inherit;
    --menu-item-fg-color: inherit;

    /** Hover */
    --menu-item-hover-bg-color: inherit;
    --menu-item-hover-border-color: inherit;
    --menu-item-hover-fg-color: inherit;

    /** Active */
    --menu-item-active-bg-color: inherit;
    --menu-item-active-border-color: inherit;
    --menu-item-active-fg-color: inherit;

    /** Disabled */
    --menu-item-disabled-bg-color: inherit;
    --menu-item-disabled-border-color: inherit;
    --menu-item-disabled-fg-color: inherit;

    /** Focus */
    --menu-item-focus-outline-color: inherit;
    --menu-item-focus-outline-offset: inherit;
  }

  [overflow] {
    --overflow-item-gap: inherit;
  }

  [popup] {
    --popup-arrow-color: inherit;
    --popup-arrow-size: inherit;
    --popup-drop-shadow: inherit;
  }

  [progress-bar] {
    --progress-bar-animation: inherit;
    --progress-bar-border-radius: inherit;
    --progress-bar-height: inherit;
    --progress-bar-indicator-color: inherit;
    --progress-bar-icon-color: inherit;
    --progress-bar-track-color: inherit;
    --progress-bar-transition: inherit;
    --form-control-label-font-weight: inherit;
    --form-control-label-gap: inherit;
  }

  [push-pane] {
    --push-pane-bg-color: inherit;
    --push-pane-size: inherit;
    --push-pane-transition: inherit;
    --push-pane-divider-color: inherit;

    --push-pane-padding-x: inherit;
    --push-pane-padding-y: inherit;
    --push-pane-body-padding-x: inherit;
    --push-pane-body-padding-y: inherit;
    --push-pane-body-margin-top: inherit;
    --push-pane-body-margin-bottom: inherit;
    --push-pane-header-padding-x: inherit;
    --push-pane-header-padding-y: inherit;
    --push-pane-footer-padding-x: inherit;
    --push-pane-footer-padding-y: inherit;

    --push-pane-close-button-bg-color: inherit;
    --push-pane-close-button-fg-color: inherit;
    --push-pane-close-button-border-color: inherit;
    --push-pane-close-button-border-width: inherit;
    --push-pane-close-button-border-radius: inherit;
    --push-pane-close-button-padding: inherit;

    --push-pane-toolbar-button-gap: inherit;
    --push-pane-footer-button-gap: inherit;

    /** close button hover */
    --push-pane-close-button-hover-bg-color: inherit;
    --push-pane-close-button-hover-border-color: inherit;
    --push-pane-close-button-hover-fg-color: inherit;

    /** close button active */
    --push-pane-close-button-active-bg-color: inherit;
    --push-pane-close-button-active-border-color: inherit;
    --push-pane-close-button-active-fg-color: inherit;

    /** close button focus */
    --push-pane-close-button-focus-bg-color: inherit;
    --push-pane-close-button-focus-border-color: inherit;
    --push-pane-close-button-focus-fg-color: inherit;
  }

  [radio] {
    --radio-control-size: inherit;
    --radio-indicator-size: inherit;

    /** Rest */
    --radio-bg-color: inherit;
    --radio-border-color: inherit;
    --radio-checked-border-color: inherit;
    --radio-label-checked-fg-color: inherit;

    /** Hover */
    --radio-hover-bg-color: inherit;
    --radio-hover-border-color-checked: inherit;
    --radio-hover-border-color-unchecked: inherit;
    --radio-label-unchecked-hover-fg-color: inherit;
    --radio-label-checked-hover-fg-color: inherit;

    /** Active */
    --radio-active-bg-color: inherit;
    --radio-active-border-color-checked: inherit;
    --radio-active-border-color-unchecked: inherit;
    --radio-label-active-fg-color: inherit;

    /** Disabled */
    --radio-disabled-bg-color: inherit;
    --radio-disabled-border-color: inherit;
    --radio-label-disabled-color: inherit;
  }

  [radio-group] {
    --radio-group-radio-gap: inherit;
  }

  [select] {
    --select-icon-size: inherit;
    --select-icon-inset: inherit;
    --select-input-padding-end: inherit;
    --select-input-padding-start: inherit;
  }

  [skeleton] {
    --skeleton-animation: inherit;
    --skeleton-bg-color: inherit;
    --skeleton-bg-size: inherit;
    --skeleton-border-radius: inherit;
    --skeleton-sheen-color: inherit;
  }

  [spinner] {
    --spinner-gap: inherit;
    --spinner-indicator-color: inherit;
    --spinner-label-color: inherit;
    --spinner-label-font-size: inherit;
    --spinner-label-font-weight: inherit;
    --spinner-label-line-height: inherit;
    --spinner-ring-size: inherit;
    --spinner-track-color: inherit;
    --spinner-track-width: inherit;
    --spinner-image-animation: inherit;
    --spinner-indicator-animation: inherit;
  }

  [switch] {
    --switch-control-transition: inherit;
    --switch-focus-outline: inherit;
    --switch-height: inherit;
    --switch-thumb-size: inherit;
    --switch-thumb-transform: inherit;
    --switch-thumb-transition: inherit;
    --switch-width: inherit;

    /* Rest */
    --switch-control-bg-color: inherit;
    --switch-control-border-color: inherit;
    --switch-control-checked-bg-color: inherit;
    --switch-control-checked-border-color: inherit;
    --switch-thumb-bg-color: inherit;
    --switch-thumb-checked-bg-color: inherit;

    /* Hover */
    --switch-control-hover-bg-color: inherit;
    --switch-control-hover-border-color: inherit;
    --switch-control-checked-hover-bg-color: inherit;
    --switch-control-checked-hover-border-color: inherit;
    --switch-thumb-hover-bg-color: inherit;
    --switch-thumb-checked-hover-bg-color: inherit;

    /* Active */
    --switch-control-active-bg-color: inherit;
    --switch-control-active-border-color: inherit;
    --switch-control-checked-active-bg-color: inherit;
    --switch-control-checked-active-border-color: inherit;
    --switch-thumb-active-bg-color: inherit;
    --switch-thumb-checked-active-bg-color: inherit;
  }

  [tab] {
    --tab-padding-x: inherit;
    --tab-padding-y: inherit;
    --tab-gap: inherit;
    --tab-font-size: inherit;
    --tab-font-weight: inherit;
    --tab-border-width: inherit;
    --tab-border-radius: inherit;
    --tab-transition: inherit;
    --tab-icon-size: inherit;

    /** Rest */
    --tab-bg-color: inherit;
    --tab-border-color: inherit;
    --tab-fg-color: inherit;

    /** Disabled */
    --tab-disabled-bg-color: inherit;
    --tab-disabled-border-color: inherit;
    --tab-disabled-fg-color: inherit;
    --tab-disabled-opacity: inherit;

    /** Hover */
    --tab-hover-bg-color: inherit;
    --tab-hover-border-color: inherit;
    --tab-hover-fg-color: inherit;

    /** Focus */
    --tab-focus-bg-color: inherit;
    --tab-focus-border-color: inherit;
    --tab-focus-fg-color: inherit;

    /** Active */
    --tab-active-bg-color: inherit;
    --tab-active-border-color: inherit;
    --tab-active-fg-color: inherit;
    --tab-active-font-weight: inherit;
  }

  [tab-panel] {
    --tab-panel-padding-x: inherit;
    --tab-panel-padding-y: inherit;
    --tab-panel-transition: inherit;
    --tab-panel-border-color: inherit;
    --tab-panel-border-width: inherit;
    --tab-panel-border-style: inherit;
    --tab-panel-border-radius: inherit;
    --tab-panel-min-height: inherit;
    --tab-panel-box-shadow: inherit;
  }

  [tabs] {
    --tabs-active-indicator-bg-color: inherit;
    --tabs-active-indicator-disabled-bg-color: inherit;
    --tabs-active-indicator-hover-bg-color: inherit;
    --tabs-active-indicator-focus-bg-color: inherit;
    --tabs-active-indicator-active-bg-color: inherit;
    --tabs-active-indicator-length: inherit;
    --tabs-active-indicator-thickness: inherit;
    --tabs-active-indicator-transition: inherit;
    --tabs-gap: inherit;
    --tabs-align: inherit;
  }

  [text-area] {
    --textarea-control-input-min-height: inherit;
    --textarea-control-input-min-width: inherit;
    --textarea-control-input-line-height: inherit;
  }

  [tooltip] {
    --tooltip-max-width: 20rem;
    --tooltip-hide-delay: 0ms;
    --tooltip-show-delay: 300ms;
    --tooltip-arrow-size: 5px;
    --tooltip-bg-color: inherit;
    --tooltip-border-radius: inherit;
    --tooltip-border-width: inherit;
    --tooltip-border-style: inherit;
    --tooltip-border-color: inherit;
    --tooltip-padding: inherit;
    --tooltip-box-shadow: inherit;
    --tooltip-transition-in: inherit;
    --tooltip-transition-out: inherit;
  }
`;
