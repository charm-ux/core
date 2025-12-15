import { getComponentMethods, getComponentProperties } from './cem-utils.ts';
import type { Component } from './types.js';

export function getPropertiesTemplate(component?: Component) {
  const properties = getComponentProperties(component);

  return !properties || properties?.length === 0
    ? ''
    : `
  ### Properties

  | Attribute / Property | Description | Type |
  | -------------------- | ----------- | ---- |
  ${properties
    .map((property: any) => {
      let propertyTypes = property['parsedType']?.text || property.type?.text || '';
      propertyTypes = propertyTypes.replaceAll('|', '\\|').replaceAll('\n', ' ');
      return `| ${
        property.attribute === undefined
          ? `\`${property.name}\` (property only)`
          : property.attribute === property.name
            ? `\`${property.attribute}\``
            : ` \`${property.attribute}\` / \`${property.name}\``
      } | ${property.description?.replaceAll('\n', ' ')} | ${propertyTypes} |`;
    })
    .join('\n')}
  `;
}

export function getMethodsTemplate(component?: Component) {
  const methods = getComponentMethods(component);

  return !methods || methods?.length === 0
    ? ''
    : `
  ### Methods

  | Name | Description | Arguments |
  | --------- | ---- | ----------- |
  ${methods
    .map((method: any) => {
      return `| ${method.name} | ${method.description?.replaceAll('\n', ' ')} | ${
        method.parameters?.map((x: any) => `\`${x.name}\`: \`${x.type?.text}\``).type?.text || '_none_'
      } | `;
    })
    .join('\n')}
  `;
}

export function getSlotTemplate(component?: Component) {
  const slots = component?.slots;

  return !slots || slots?.length === 0
    ? ''
    : `
  ### Slots

  | Name | Description |
  | ---- | ----------- |
  ${slots
    ?.map((slot: any) => {
      return `| ${slot.name === '' || slot.name === 'default' ? '_default_' : `\`${slot.name}\``} | ${
        slot.description
      } |`;
    })
    .join('\n')}
  `;
}

export function getEventsTemplate(component?: Component) {
  const events = component?.events;

  return !events || events?.length === 0
    ? ''
    : `
  ### Events

  | Name | Description | Event Detail |
  | ---- | ----------- | ------------ |
  ${events
    ?.map((event: any) => {
      return `| \`${event.name}\` | ${event.description} | ${
        event['parsedType']?.text || event.type?.text || '_none_'
      } |`;
    })
    .join('\n')}
  `;
}

export function getCSSPropertiesTemplate(component?: Component) {
  const cssProperties = component?.cssProperties;

  return !cssProperties || cssProperties?.length === 0
    ? ''
    : `
  ### CSS Custom Properties

  | Name | Description | Default |
  | ---- | ----------- | ------- |
  ${cssProperties
    ?.map((property: any) => {
      return `| \`${property.name}\` | ${property.description} | ${property.defaultValue} |`;
    })
    .join('\n')}
  `;
}

export function getCSSPartsTemplate(component?: Component) {
  const cssParts = component?.cssParts;

  return !cssParts || cssParts?.length === 0
    ? ''
    : `
  ### CSS Parts

  | Name | Description |
  | ---- | ----------- |
  ${cssParts
    ?.map((part: any) => {
      return `| \`${part.name}\` | ${part.description} |`;
    })
    .join('\n')}
  `;
}
