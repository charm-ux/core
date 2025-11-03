import { project } from '../../utilities/project.js';
import menuItem from './menu-item.js';

export * from './menu-item.js';

project.scope.registerComponent(menuItem);
