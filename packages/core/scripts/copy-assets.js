import fs from 'fs';
import path from 'path';

function copyTheme() {
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }

  fs.copyFileSync(path.resolve('./dist/themes/charm/reset.css'), path.resolve('public/reset.css'));
  fs.copyFileSync(path.resolve('./dist/themes/charm/theme.css'), path.resolve('public/theme.css'));
  fs.copyFileSync(path.resolve('./dist/themes/charm/utility-classes.css'), path.resolve('public/utility-classes.css'));
}

copyTheme();
