import { CodeBubble } from 'https://esm.run/code-bubble@1.3.3';

async function fetchLibData(url) {
  try {
    const base = location.href.includes('localhost') ? '' : document.location.origin;
    const response = await fetch(base + url); // Make the request
    return await response.text(); // Extract JSON data
  } catch (error) {
    console.error('Error fetching data:', base + url, error);
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

new CodeBubble({
  sandbox: 'stackblitz',
  sandboxConfig: {
    /** StackBlitz sandbox configuration */
    stackBlitz: {
      html: {
        project: {
          title: 'Charm Kitchen Sink',
          description: 'A live demo of all the components in Charm',
          files: {
            'libs/kitchen-sink.js': await fetchLibData('/charm/kitchen-sink.js'),
            'libs/reset.css': await fetchLibData('/charm/reset.css'),
            'libs/theme.css': await fetchLibData('/charm/theme.css'),
            'libs/utility-classes.css': await fetchLibData('/charm/utility-classes.css'),
          },
        },
        exampleTemplate: {
          fileName: 'index.html',
          template: `<!DOCTYPE html>
  <html lang="en" dir="ltr" class="charm-light">
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
