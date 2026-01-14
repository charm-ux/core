import { project } from '../../utilities/project.js';
import progressBar from './progress-bar.js';

export * from './progress-bar.js';

project.scope.registerComponent(progressBar);
