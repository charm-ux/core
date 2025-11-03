import { project } from '../../utilities/project.js';
import pushPane from './push-pane.js';

export * from './push-pane.js';

project.scope.registerComponent(pushPane);
