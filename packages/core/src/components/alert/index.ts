import { project } from '../../utilities/project.js';
import alert from './alert.js';

export * from './alert.js';

project.scope.registerComponent(alert);
