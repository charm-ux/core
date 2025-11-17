import { setWcDoxConfig } from 'https://cdn.jsdelivr.net/npm/wc-dox@1.3.5/cdn/+esm';
import manifest from '../custom-elements.json';

export function getAllComponents(customElementsManifest, exclude = []) {
  if (!customElementsManifest) {
    return [];
  }

  const components = [];

  customElementsManifest.modules?.forEach(module => {
    const ces = module.declarations?.filter(d => d.customElement);

    if (ces?.length) {
      ces?.forEach(ce => {
        if (exclude?.includes(ce.name)) {
          return;
        }

        components.push(ce);
      });
    }
  });

  return components;
}

export function getComponentByTagName(customElementsManifest, tagName) {
  return getAllComponents(customElementsManifest).find(c => c?.tagName === tagName);
}

console.log('Setting wc-dox config with manifest:', getComponentByTagName(manifest, 'ch-accordion'));
setWcDoxConfig(manifest);
