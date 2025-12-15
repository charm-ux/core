---
title: Installation
---

## Prerequisites

- In order to build and run Charm projects you will need [Node](https://nodejs.org) of at least version 18 installed.
- You will need access to the Azure DevOps feed for use as an upstream source. To access the feed, request approval in CoreIdentity for the CHARM ADO Reader entitlement. This process can take up to 24 hours to complete. Once approved, you can access the feed and install the components.
- Once you have received the entitlement from CoreIdentity, please try to log in the ADO instance by visiting <https://dev.azure.com/charm-pilot>. If you are unable to access the ADO instance, please reach out to the team for further assistance.

### Connect to Azure DevOps feed

To install the components from the private registry, connect to the Azure DevOps feed. This process requires an Azure DevOps account and generating a personal access token (PAT) with the appropriate permissions.

### Configure upstream registry

Within Azure DevOps you can get your registry URL and configure your upstream feed sources to point to our charm-feed feed. This is required to install the components from the private registry.

> **Note**: Upstream configuration order matters so ensure the following sources - npmjs and our feed - are at the top before configuring any other upstream feeds.

1. Navigate to your team's Artifacts connection feed in Azure DevOps and click the gear icon (Settings)
2. If outside our org: Ensure that you have npmjs as an upstream source. For this source, choose Public source to add it.
3. For the library source, choose either Azure artifacts feed in this organization or Azure artifacts feed in another organization. The type you click depends on whether you are in our organization or in a different organization. For the same organization, find charm-feed feed and select Local for the view.

If you are in a different organization, provide a feed locator with these settings:

- **Feed locator**: `azure-feed://charm-pilot/charm-pilot/charm-feed@Local`
- **Check**: npm
- **Upstream source name**: `charm-feed@Local`

If you're unable to add an upstream feed, then your role does not have permission and you'll need to sync with your team to get the upstream sources added.

### Configure pipeline in Azure DevOps

If you've added the upstream sources correctly, you should be able to authenticate to our feed without needing to create a service connection. AzureDevops automatically creates a service connection for you.

### Add to .npmrc

Add an `.npmrc` to your project in the same directory as your `package.json`.

Add the following code snippet to your `.npmrc` file.

```sh
@charm-ux:registry=<your-teams-registry-url>
always-auth=true
```

The registry URL is how to access the feed you configured the upstream sources for in the previous step, and has a format similar to `<https://pkgs.dev.azure.com/<organization>/_packaging/<team-feed-name>/npm/registry/>`.

### Local development: authenticate with PAT

#### Windows users

If it's not already, globally install the vsts-npm-auth package:

```sh
npm install -g vsts-npm-auth
```

Then run the following command to authenticate with your PAT:

```sh
vsts-npm-auth -config .npmrc
```

#### macOS and Linux users

Review the feed instructions for [Project setup > Personal Access Token](https://dev.azure.com/charm-pilot/charm-pilot/_artifacts/feed/charm-feed/connect) to setup your credentials.

Note that step 1 refers to a user-level .npmrc file which is in addition to the .npmrc file in your project.

### Install component library

Once you have connected to the Azure DevOps feed, you can install the component library package. The package name is `@charm-ux/core`.

To install the components from the package registry, run the following command (or use your preferred package manager):

```sh
npm install @charm-ux/core
```

### Include the theme

The library theme is a CSS stylesheet that provides default custom properties and styles for the components.

To use the theme, you must include the theme stylesheet:

```html
<link rel="stylesheet" href="./node_modules/@charm-ux/core/dist/themes/charm/theme.css" />
```

Review [full theme documentation](/theming) for more details on customizing the theme, as well as additional stylesheets you may want to include like a reset and dark mode.

Depending on your build process and any bundler you may be using, you may need to copy the CSS file to a location that your build process can access. For example, you may need to copy the CSS file to a public directory and update the href path in the link tag.

### Use the components

Finally, import the components you want to use, and place the tag for the component in your application.

```html
<!-- import '@charm-ux/core/dist/components/button/index.js'; -->

<ch-button>My button</ch-button>
```
