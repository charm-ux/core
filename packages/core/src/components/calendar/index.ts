import { project } from '../../utilities/project.js';
import calendar from './calendar.js';

export * from './calendar.js';

project.scope.registerComponent(calendar);
