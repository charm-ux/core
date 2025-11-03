# Introduction

CHARM - Coherence + HARMony Core components

## Getting Started

Choose the steps between macOS/Linux or Windows to get started.

##### macOS/Linux

1. Get new PAT in ADO for `charm-pilot` (`https://dev.azure.com/charm-pilot/_usersSettings/tokens`)
   1. make sure to add `Read` access to `Packaging`

1. Base64 Encode PAT

   ```bash
   node -e "require('readline') .createInterface({input:process.stdin,output:process.stdout,historySize:0}) .question('PAT> ',p => { b64=Buffer.from(p.trim()).toString('base64');console.log(b64);process.exit(); })"
   ```

1. Place base64 encoded PAT in your root `~/.npmrc` file

   ```bash
   ; begin auth token
   //pkgs.dev.azure.com/charm-pilot/charm-pilot/_packaging/charm-feed/npm/registry/:username=[ENTER_ANY_VALUE_BUT_NOT_AN_EMPTY_STRING]
   //pkgs.dev.azure.com/charm-pilot/charm-pilot/_packaging/charm-feed/npm/registry/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
   //pkgs.dev.azure.com/charm-pilot/charm-pilot/_packaging/charm-feed/npm/registry/:email=npm requires email to be set but doesn't use the value
   //pkgs.dev.azure.com/charm-pilot/charm-pilot/_packaging/charm-feed/npm/:username=[ANY_VALUE_BUT_NOT_AN_EMPTY_STRING]
   //pkgs.dev.azure.com/charm-pilot/charm-pilot/_packaging/charm-feed/npm/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
   //pkgs.dev.azure.com/charm-pilot/charm-pilot/_packaging/charm-feed/npm/:email=npm requires email to be set but doesn't use the value
   ; end auth token
   ```

1. [install pnpm](https://pnpm.io/installation#using-npm) at **latest version 8**.
   - We use version 8 to avoid issues where version 9 updates the lockfile format.

   - To install globally:
     1. Using NPM > `npm install -g pnpm@latest-9`
     2. Using Homebrew (mac) > `brew install pnpm@9`

1. run `pnpm i`

##### Windows

1. Run `vsts-npm-auth` to get an Azure Artifacts token added to your user-level `.npmrc` file

> **NOTE**
> If you run into this error:
> `vsts-npm-auth: The term 'vsts-npm-auth' is not recognized as a name of a cmdlet, function, script file, or executable program.`
>
> You need to install `vsts-npm-auth`.
> `npm i -g vsts-npm-auth`
>
> Then, to generate an .npmrc file, run
> `vsts-npm-auth -config .npmrc`

2. [install pnpm](https://pnpm.io/installation#using-npm)

3. run `pnpm i`

### Node version

We recommend using [nvm](https://github.com/nvm-sh/nvm) or [nvm-for-windows](https://github.com/coreybutler/nvm-windows) to manage node versions.

You will need node version >=18.14.1 in order to run the docsite package. If you have NVM installed, you can run `nvm use`, which will automatically switch to the node version specified in this project's .nvmrc file.

## Storybook

You can run [storybook](https://storybook.js.org/docs/web-components/get-started/why-storybook) for each package using the `dev` command - ie

```bash
# runs the storybook for the web components in the core project
pnpm dev:core

# runs the storybook for the web components in the demo project
pnpm dev:demo

# runs the storybook for the react components in the demo project
pnpm dev:react
```

## Docsite

You can run the docsite by running `pnpm dev:docsite`

## Testing

There are a variety of tests that can be run within each project - all tests, a single component tests, and performance test.

### Running All Tests

To run all tests for each project, you can run:

```bash
pnpm test:core

# or

pnpm test:demo
```

### Single Component Tests

To run a single test, run the "single" test script followed by the name of the test you want to run:

```bash
pnpm test:core-single scope

# or

pnpm test:demo-single button
```

### Performance Tests

Performance tests are run independently from other tests.

```bash
pnpm test:core-performance
```

## Contribute

Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) guide for detailed information on how to contribute to this project.

### Version management

Charm uses Changesets for version management and release automation. When making changes that should be published, you need to add a changeset:

```bash
pnpm changeset
```

For detailed instructions on when and how to add changesets, see the [CONTRIBUTING.md](./CONTRIBUTING.md#creating-a-changeset) file.

> **Note:** We also maintain beachball for legacy support. You can learn more about how to use beachball in our version-management wiki page.

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:

- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)

### Changelog

#### Using Changesets (Recommended)

For new changes, use Changesets to document your changes:

```bash
pnpm changeset
```

See [CONTRIBUTING.md](./CONTRIBUTING.md#creating-a-changeset) for detailed instructions.

#### Using Beachball (Legacy)

Adding items to the changelog using beachball:

```bash
pnpm beachball:change
```

Add a [descriptive change message](https://charmcore.z5.web.core.windows.net/docsite/contributing/version-management/#describing-changes).

### Releasing

1. Make sure everything on the `main` branch is ready for release (changelog, version number bump, etc) and pull down next.
1. Create a branch from "main" for release preparation: `git checkout -b alias/release-prep-alpha19`
1. Run the following: `pnpm beachball:bump`, inspect `/packages/core/CHANGELOG.md` and make sure it looks correct.
   This will automatically bump the version in `package.json` so it doesn't need to be manually edited.
1. Make a PR onto "main" with your preparations.
1. Once your PR is merged, visit the [Release pipeline](https://dev.azure.com/charm-pilot/charm-pilot/_build?definitionId=2) and click "Run Pipeline" and run on the main branch.
