import { createCssHelpers, charmDefinition } from '@charm-ux/theming';

const helpers = createCssHelpers(charmDefinition, 'charm');

export const primitive = helpers.primitive;
export const semantic = helpers.semantic;
export const component = helpers.component;
