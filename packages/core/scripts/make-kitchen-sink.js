import fs from 'fs';
import manifest from '../custom-elements.json' with { type: 'json' };

function getComponents(customElementsManifest, exclude) {
  return (
    customElementsManifest.modules?.map(
      mod => mod?.declarations?.filter(dec => !exclude?.includes(dec.name) && (dec.customElement || dec.tagName)) || []
    ) || []
  ).flat();
}

function generateKitchenSink(customElementsManifest, exclude) {
  const components = getComponents(customElementsManifest, exclude);

  let componentPaths = components
    .map(component => {
      return `export * from './components/${component.tagName.replace('ch-', '')}/index.js';`;
    })
    .sort()
    .join('\n');
  componentPaths += `\nexport { project } from './utilities/project.js';`;

  fs.writeFileSync('./src/kitchen-sink.ts', componentPaths);
}

generateKitchenSink(manifest, [
  'CharmElement',
  'CharmDismissibleElement',
  'CharmFocusableElement',
  'CharmFormControlElement',
]);
