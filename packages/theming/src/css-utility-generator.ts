import { CSSResult } from 'lit';
import { getCssValue, toKebabCase } from './utilities.js';

export function generateCssUtilities(
  tokenName: string,
  values: any,
  cssUtilities: string[] = [],
  tokenPrefix?: string
): string[] {
  const prefix = `--${tokenPrefix ? tokenPrefix + '-' : ''}`;
  const updatedValues = getUpdatedValues(values);

  switch (tokenName) {
    case 'borderRadius':
      setBorderRadiusUtilities(updatedValues, prefix, cssUtilities);
      break;
    case 'borderWidth':
      setBorderWidthUtilities(updatedValues, prefix, cssUtilities);
      break;
    case 'color':
      setColorUtilities(updatedValues, prefix, cssUtilities);
      break;
    case 'duration':
      setDurationUtilities(updatedValues, prefix, cssUtilities);
      break;
    case 'fontFamily':
      setFontFamilyUtilities(updatedValues, prefix, cssUtilities);
      break;
    case 'fontSize':
      setFontSizeUtilities(updatedValues, prefix, cssUtilities);
      break;
    case 'fontWeight':
      setFontWeightUtilities(updatedValues, prefix, cssUtilities);
      break;
    case 'lineHeight':
      setLineHeightUtilities(updatedValues, prefix, cssUtilities);
      break;
    case 'shadow':
      setShadowUtilities(updatedValues, prefix, cssUtilities);
      break;
    case 'spacing':
      setSpacingUtilities(updatedValues, prefix, cssUtilities);
      break;
    case 'timingFunction':
      setTimingFunctionUtilities(updatedValues, prefix, cssUtilities);
      break;
    case 'zIndex':
      setZIndexUtilities(updatedValues, prefix, cssUtilities);
      break;
  }

  return cssUtilities;
}

export function addGlobalCssUtilities(cssUtilities: string, extendedCssUtilities: CSSResult | string = '') {
  return `
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. CONTENTS CAN BE CHANGED IN YOUR THEME CONFIG. */

.d-block {
  display: block !important;
}

.d-inline {
  display: inline !important;
}

.d-inline-block {
  display: inline-block !important;
}

.d-inline-flex {
  display: inline-flex !important;
}

.d-flex {
  display: flex !important;
}

.flex-wrap {
  flex-wrap: wrap !important;
}

.flex-nowrap {
  flex-wrap: nowrap !important;
}

.flex-row {
  flex-direction: row !important;
}

.flex-row-reverse {
  flex-direction: row-reverse !important;
}

.flex-column {
  flex-direction: column !important;
}

.flex-column-reverse {
  flex-direction: column-reverse !important;
}

.flex-shrink-0 {
  flex-shrink: 0 !important;
}

.flex-shrink-1 {
  flex-shrink: 1 !important;
}

.flex-grow-0 {
  flex-grow: 0 !important;
}

.flex-grow-1 {
  flex-grow: 1 !important;
}

.space-between {
  justify-content: space-between !important;
}

.space-around {
  justify-content: space-around !important;
}

.space-evenly {
  justify-content: space-evenly !important;
}

.justify-center {
  justify-content: center !important;
}

.justify-start {
  justify-content: start !important;
}

.justify-end {
  justify-content: end !important;
}

.align-center {
  align-items: center !important;
}

.align-start {
  align-items: start !important;
}

.align-end {
  align-items: end !important;
}

.align-stretch {
  align-items: stretch !important;
}

.d-initial {
  display: initial !important;
}

.d-none {
  display: none !important;
}

.visible {
  visibility: visible !important;
}

.hidden {
  visibility: hidden !important;
}

.visually-hidden:not(:focus):not(:focus-within) {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  clip: rect(0 0 0 0) !important;
  clip-path: inset(50%) !important;
  border: none !important;
  overflow: hidden !important;
  white-space: nowrap !important;
  padding: 0 !important;
}

.m-auto {
  margin: auto !important;
}

.ms-auto {
  margin-inline-start: auto !important;
}

.me-auto {
  margin-inline-end: auto !important;
}

.mt-auto {
  margin-block-start: auto !important;
}

.mb-auto {
  margin-block-end: auto !important;
}

.mx-auto {
  margin-inline: auto !important;
}

.my-auto {
  margin-block: auto !important;
}

${cssUtilities}
${getCssValue(extendedCssUtilities)}
`;
}

function setBorderRadiusUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    cssUtilities.push(`
.br-${key} {
  border-radius: var(${prefix}border-radius-${key}) !important;
}

.br-s-${key} {
  border-start-start-radius: var(${prefix}border-radius-${key}) !important;
  border-end-start-radius: var(${prefix}border-radius-${key}) !important;
}

.br-ss-${key} {
  border-start-start-radius: var(${prefix}border-radius-${key}) !important;
}

.br-es-${key} {
  border-end-start-radius: var(${prefix}border-radius-${key}) !important;
}

.br-e-${key} {
  border-start-end-radius: var(${prefix}border-radius-${key}) !important;
  border-end-end-radius: var(${prefix}border-radius-${key}) !important;
}

.br-se-${key} {
  border-start-end-radius: var(${prefix}border-radius-${key}) !important;
}

.br-ee-${key} {
  border-end-end-radius: var(${prefix}border-radius-${key}) !important;
}

.br-t-${key} {
  border-start-start-radius: var(${prefix}border-radius-${key}) !important;
  border-start-end-radius: var(${prefix}border-radius-${key}) !important;
}

.br-b-${key} {
  border-end-start-radius: var(${prefix}border-radius-${key}) !important;
  border-end-end-radius: var(${prefix}border-radius-${key}) !important;
}`);
  }
}

function setBorderWidthUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    cssUtilities.push(`
.b-${key} {
  border: var(--default-border-color) var(--default-border-style) var(${prefix}border-width-${key}) !important;
}

.bs-${key} {
  border-inline-start: var(--default-border-color) var(--default-border-style) var(${prefix}border-width-${key}) !important;
}

.be-${key} {
  border-inline-end: var(--default-border-color) var(--default-border-style) var(${prefix}border-width-${key}) !important;
}

.bt-${key} {
  border-block-start: var(--default-border-color) var(--default-border-style) var(${prefix}border-width-${key}) !important;
}

.bb-${key} {
  border-block-end: var(--default-border-color) var(--default-border-style) var(${prefix}border-width-${key}) !important;
}

.bx-${key} {
  border-inline: var(--default-border-color) var(--default-border-style) var(${prefix}border-width-${key}) !important;
}

.by-${key} {
  border-block: var(--default-border-color) var(--default-border-style) var(${prefix}border-width-${key}) !important;
}
`);
  }
}

function setColorUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    for (const variation in values[key]) {
      cssUtilities.push(`
.bg-${key}-${variation} {
  background-color: var(${prefix}color-${key}-${variation}) !important;
  color: var(${prefix}color-${key}-${variation}-alt) !important;
}

.fg-${key}-${variation} {
  color: var(${prefix}color-${key}-${variation}) !important;
}

.b-${key}-${variation} {
  border-color: var(${prefix}color-${key}-${variation}) !important;
}

.bs-${key}-${variation} {
  border-inline-start-color: var(${prefix}color-${key}-${variation}) !important;
}

.be-${key}-${variation} {
  border-inline-end-color: var(${prefix}color-${key}-${variation}) !important;
}

.bt-${key}-${variation} {
  border-block-start-color: var(${prefix}color-${key}-${variation}) !important;
}

.bb-${key}-${variation} {
  border-block-end-color: var(${prefix}color-${key}-${variation}) !important;
}

.bx-${key}-${variation} {
  border-inline-color: var(${prefix}color-${key}-${variation}) !important;
}

.by-${key}-${variation} {
  border-block-color: var(${prefix}color-${key}-${variation}) !important;
}
`);
    }
  }
}

function setDurationUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    cssUtilities.push(`
.duration-${toKebabCase(key)} {
  transition-duration: var(${prefix}duration-${key}) !important;
}`);
  }
}

function setFontFamilyUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    cssUtilities.push(`
.font-${key} {
  font-family: var(${prefix}font-family-${key}) !important;
}`);
  }
}

function setFontSizeUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    cssUtilities.push(`
.font-${key} {
  font-size: var(${prefix}font-size-${key}) !important;
}`);
  }
}

function setFontWeightUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    cssUtilities.push(`
.font-${key} {
  font-weight: var(${prefix}font-weight-${key}) !important;
}`);
  }
}

function setLineHeightUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    cssUtilities.push(`
.lh-${key} {
  line-height: var(${prefix}line-height-${key}) !important;
}`);
  }
}

function setShadowUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    cssUtilities.push(`
.shadow-${key} {
  box-shadow: var(${prefix}shadow-${key}) !important;
}`);
  }
}

function setSpacingUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    cssUtilities.push(`
.p-${key} {
  padding: var(${prefix}spacing-${key}) !important;
}

.pt-${key} {
  padding-block-start: var(${prefix}spacing-${key}) !important;
}

.pe-${key} {
  padding-inline-end: var(${prefix}spacing-${key}) !important;
}

.pb-${key} {
  padding-block-end: var(${prefix}spacing-${key}) !important;
}

.ps-${key} {
  padding-inline-start: var(${prefix}spacing-${key}) !important;
}

.px-${key} {
  padding-inline: var(${prefix}spacing-${key}) !important;
}

.py-${key} {
  padding-block: var(${prefix}spacing-${key}) !important;
}

.m-${key} {
  margin: var(${prefix}spacing-${key}) !important;
}

.mt-${key} {
  margin-block-start: var(${prefix}spacing-${key}) !important;
}

.me-${key} {
  margin-inline-end: var(${prefix}spacing-${key}) !important;
}

.mb-${key} {
  margin-block-end: var(${prefix}spacing-${key}) !important;
}

.ms-${key} {
  margin-inline-start: var(${prefix}spacing-${key}) !important;
}

.mx-${key} {
  margin-inline: var(${prefix}spacing-${key}) !important;
}

.my-${key} {
  margin-block: var(${prefix}spacing-${key}) !important;
}

.gap-${key} {
  gap: var(${prefix}spacing-${key}) !important;
}
`);
  }
}

function setTimingFunctionUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    cssUtilities.push(`
.tf-${toKebabCase(key)} {
  transition-timing-function: var(${prefix}timing-function-${key}) !important;
}`);
  }
}

function setZIndexUtilities(values: any, prefix: string, cssUtilities: string[] = []) {
  for (const key in values) {
    cssUtilities.push(`
.z-${key} {
  z-index: var(${prefix}z-index-${key}) !important;
}`);
  }
}

function getUpdatedValues(values: any) {
  const updatedValues: any = {};

  for (const key in values) {
    updatedValues[toKebabCase(key)] = values[key];
  }

  return updatedValues;
}
