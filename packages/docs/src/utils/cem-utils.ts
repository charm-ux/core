import * as schema from 'custom-elements-manifest';
import cem from '../../custom-elements.json' assert { type: 'json' };
import type { Component } from './types.js';

/**
 * Gets a list of components from a CEM object
 * @returns Component[]
 */
export function getComponents(): schema.Declaration[] {
  return (
    (cem as schema.Package).modules?.map(
      mod => mod?.declarations?.filter(dec => (dec as Component).customElement || (dec as Component).tagName) || []
    ) || []
  ).flat() as Component[];
}

/** Get a component by the tag name */
export function getComponentByTag(tagName: string): Component | undefined {
  return getComponents().find(c => (c as Component).tagName === tagName) as Component | undefined;
}

/**
 * Gets a list of public properties from a CEM component
 * @param component CEM component/declaration object
 * @returns an array of public properties for a given component
 */
export function getComponentProperties(component?: Component) {
  return component?.members?.filter(
    member =>
      member.kind === 'field' && member.privacy !== 'private' && member.privacy !== 'protected' && !member.static
  ) as schema.ClassMember[];
}

/**
 * Get all public methods for a component
 * @param component CEM component/declaration object
 * @returns ClassMethod[]
 */
export function getComponentMethods(component?: Component): schema.ClassMethod[] {
  return component?.members?.filter(
    member => member.kind === 'method' && member.privacy === 'public' && member.description?.length
  ) as schema.ClassMethod[];
}
