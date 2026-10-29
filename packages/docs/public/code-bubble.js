import { CodeBubble } from 'https://esm.run/code-bubble@1.3.3';

async function fetchLibData(url) {
  const resolved = new URL(url, import.meta.url);
  try {
    const response = await fetch(resolved); // Make the request
    return await response.text(); // Extract JSON data
  } catch (error) {
    console.error('Error fetching data:', resolved.href, error);
    return null; // Handle the error gracefully
  }
}

// a little hack because script tags cannot be in templates in scripts because it will close the parent script tag
function createScript(src) {
  const script = document.createElement('script');
  script.src = src;
  script.type = 'module';
  return script.outerHTML;
}

const libFiles = await Promise.all(
  ['kitchen-sink.js', 'reset.css', 'theme.css', 'utility-classes.css'].map(async name => [
    `libs/${name}`,
    await fetchLibData(`./charm/${name}`),
  ])
);

new CodeBubble({
  sandbox: 'stackblitz',
  sandboxConfig: {
    /** StackBlitz sandbox configuration */
    stackBlitz: {
      html: {
        project: {
          title: 'Charm Kitchen Sink',
          description: 'A live demo of all the components in Charm',
          files: Object.fromEntries(libFiles),
        },
        exampleTemplate: {
          fileName: 'index.html',
          template: `<!DOCTYPE html>
  <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8" />
      <title>Harmony - JavaScript</title>
      <base href="/" />

      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" type="image/x-icon" href="favicon.ico" />
      <link rel="stylesheet" href="libs/reset.css">
      <link rel="stylesheet" href="libs/theme.css">
      <link rel="stylesheet" href="libs/utility-classes.css">
      ${createScript('/libs/kitchen-sink.js')}
    </head>

    <body>
      %example%
    </body>
  </html>`,
        },
      },
    },
  },
});
