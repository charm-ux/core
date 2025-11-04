import { getComponentByTag } from './cem-utils.ts';

const componentName = (url: string) =>
  url
    .replace(/(^\/)|(\/$)/g, '') // remove leading and trailing slashes
    .split('/') // split into array
    .at(-1); // get last element

export const componentFromPath = (pathname: string) => getComponentByTag('ch-' + componentName(pathname));
