import { project } from '../../utilities/project.js';
import theme from './scoped-styles.js';

export * from './scoped-styles.js';

project.scope.registerComponent(theme);
