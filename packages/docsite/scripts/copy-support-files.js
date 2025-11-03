import fs from 'fs';
import path from 'path';

try {
  copyReadmeFiles();
  copyManifest();
  copyTheme();
  copyChangelogs();
} catch (error) {
  console.error(error);
}

function copyReadmeFiles() {
  if (!fs.existsSync(path.resolve('src/content/docs/reference'))) {
    fs.mkdirSync(path.resolve('src/content/docs/reference'));
  }

  const componentPath = path.resolve('../core/src/components');
  fs.readdirSync(componentPath).forEach(component => {
    if (component.endsWith('.ts')) {
      return;
    }

    const contents = `---
title: ${component}
---

${fs.readFileSync(path.join(componentPath, component, 'README.md'), 'utf8')}
    `;

    fs.writeFileSync(path.resolve('src/content/docs/reference', `${component}.md`), contents);
  });

  // Copy theming README
  if (!fs.existsSync(path.resolve('src/content/docs/theming'))) {
    fs.mkdirSync(path.resolve('src/content/docs/theming'));
  }

  const themingReadme = path.resolve('../theming/README.md');
  const themingContents = `---
title: Theming
---

${fs.readFileSync(themingReadme, 'utf8')}`;
  fs.writeFileSync(path.resolve('src/content/docs/theming/index.md'), themingContents);
}

function copyManifest() {
  fs.copyFileSync(path.resolve('../core/custom-elements.json'), path.resolve('./custom-elements.json'));
}

function copyTheme() {
  fs.copyFileSync(path.resolve('../core/dist/themes/charm/reset.css'), path.resolve('public/charm/reset.css'));
  fs.copyFileSync(path.resolve('../core/dist/themes/charm/theme.css'), path.resolve('public/charm/theme.css'));
  fs.copyFileSync(
    path.resolve('../core/dist/themes/charm/utility-classes.css'),
    path.resolve('public/charm/utility-classes.css')
  );
}

function copyChangelogs() {
  if (!fs.existsSync(path.resolve('src/content/docs/changelog'))) {
    fs.mkdirSync(path.resolve('src/content/docs/changelog'));
  }

  ['core', 'theming'].forEach(changelog => {
    const contents = `---
title: "@charm/${changelog}"
---

${fs.readFileSync(path.join(`../${changelog}/CHANGELOG.md`), 'utf8')}
  `;

    fs.writeFileSync(path.resolve(`src/content/docs/changelog/${changelog}.md`), contents);
  });
}
