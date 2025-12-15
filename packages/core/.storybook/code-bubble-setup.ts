import { CodeBubble } from 'code-bubble';

(async () => {
  async function fetchLibData(url: string) {
    const baseUrl = window.location.host.includes('localhost') ? '' : window.location.host + window.location.pathname;

    try {
      const response = await fetch(baseUrl + url); // Make the request
      return await response.text(); // Extract JSON data
    } catch (error) {
      console.error('Error fetching data:', url, error);
      return null; // Handle the error gracefully
    }
  }

  /** @type { import('code-bubble').CodeBubbleConfig } */
  new CodeBubble({
    sandbox: 'stackblitz',
    sandboxConfig: {
      /** StackBlitz sandbox configuration */
      stackBlitz: {
        html: {
          project: {
            title: 'Charm UI',
            description: 'A live demo of components in Charm',
            files: {
              'libs/charm/index.js': (await fetchLibData('/index.js')) || '',
              'libs/charm/theme.css': (await fetchLibData('/theme.css')) || '',
            },
          },
          exampleTemplate: {
            fileName: 'index.html',
            template: `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <title>Charm C+E - HTML</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <link rel="stylesheet" href="libs/charm/theme.css">
    <script type="module" src="libs/charm/index.js"></script>
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
})();
