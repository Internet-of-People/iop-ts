# Morpheus

Morpheus is a decentralized identity system with an open ecosystem enabling verifiable claims in a
web-of-trust way. See the [specification](https://iop-stack.gitlab.iop-ventures.com/dids-and-claims/specification) or check out the [whitepaper](https://iop.global/whitepaper/) where this fits.

## Table of Contents <!-- omit in toc -->

- [Morpheus and DIDs](#Morpheus-and-DIDs)
- [Current and Future Features](#Current-and-Future-Features)
- [How to Use](#How-to-Use)
  - [Install](#Install)
    - [Prerequisites](#Prerequisites)
    - [NodeJS Scripts](#NodeJS-Scripts)
  - [Usage](#Usage)
    - [examples](#examples)
    - [did-manager](#did-manager)
    - [hydra-plugin](#hydra-plugin)
    - [keyvault](#keyvault)
    - [kyc-user](#kyc-user)
    - [logger](#logger)
- [Maintainers](#Maintainers)
- [Contributing](#Contributing)
- [License](#License)

## Morpheus and DIDs

Morpheus relies on the Hydra Blockchain and custom transactions to build a repository of DID documents.
These documents establish the identity of an entity even when using different cryptographic keys over time, and contain no personal identifiable information.
Personal data will be stored elsewhere (decided by the users and service providers), using the Morpheus DB for establishing validity of information. 

**This way, Morpheus far exceeds the [GDPR](https://gdpr-info.eu/) requirements.**

Additionally, Morpheus DID Documents allow referencing other web locations that contain additional information about the entity (service endpoints),
allowing for publicly claiming DIDs.

Morpheus forms the basis of secure transmission and validation of personal information in the IOP ecosystem and will enable a multitude of use-cases, such as the ones described below:
- separating personal and business roles
- digitalized ID documents
- digital tickets for public transport, cinemas, concerts, etc. (both personalized and non-personalized)
- KYC and AML verification with minimal data disclosure
- reusing verification with different service providers
- offline verification of ID ownership
- and many more


## Current and Future Features

[ x ] Query implicit DID Documents
[ x ] Add/Revoke Key to DID
[ x ] Add/Revoke Right to DID
[ x ] Tombstone DID
[ x ] Dry run on state
[ ] Add/Remove Service Endpoint

## How to Use

Morpheus will be used as by default plugin on the Hydra chain, hence will be shipped with the [Hydra core](https://github.com/Internet-of-People/hydra-core) code.
However this repo can also be used standalone for demo and testing purposes until we provide an SDK.

Under the examples package you will see example codes for all available API.

### Install

#### Prerequisites

- Node v12.13.1
  ```bash
  # Install nvm to easily switch between node versions
  $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash
  # Install node itself using nvm
  $ nvm install v12.13.1
  # Set the just installed version 12 as default
  $ nvm alias default v12.13.1
  # Check versions
  $ node --version
  v12.13.1
  ```
- npm 6.13.4

#### NodeJS Scripts

We use [Lerna](https://lerna.js.org/) for this multipackage project. We have these commands available under the root:

```bash
# Installs all dependencies
$ npm install
```
```bash
# Cleans all packages' node_modules and dist directory including the root itself
$ npm run clean
```
```bash
# Builds all packages
$ npm run build
```

```bash
# Runs all packages' tests
$ npm run test
```

```bash
# Runs EsLint on all packages' code
$ npm run lint
```

### Usage

Here we describe how can the packages be used and what responsbility a package has.

#### examples

This package contains a command line NodeJS application where you can try out the available endpoints. 
There you can also observe the code to see how the components (like did-manager) are used. For more details how to use it, please check its [README](packages/examples/README.md).

Note: it requires a node running that supports Morpheus.

#### did-manager

This package contains all business logic that needed for DID management, hence can be used for building Morpheus transactions and parsing results.

#### hydra-plugin

This is a Hydra plugin that will be started up when your node is running. Receives block events (Layer 1) and forwards it to the business logic (Layer 2).

#### keyvault

This is a webassembly binding for our keyvault written in Rust.

#### kyc-user

TBD

#### logger

A simple logging utility used by multitple packages. Uses Hydra's built in chain logger package.

## Maintainers

* [@izolyomi](https://github.com/izolyomi)
* [@mudlee](https://github.com/mudlee)
* [@wigy_opensource_developer](https://github.com/wigy_opensource_developer)

## Contributing

Feel free to open issues and send pull requests in this repository. By sending contributions, you are agreeing to transfer all intellectual property from your changes to the Decentralized Society Foundation, Panama, who owns the copyright of this code. To avoid losing precious time you spend on coding, you could
open an issue first and discuss what you are up to before forking and sending us
a PR.

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

We are using a commit hook and quite strict linting rules for our codebase. Please install `husky` to check your commits before you send us pull requests. This requires git >= 2.13 so does not work on Ubuntu 16.04 Xenial Xerus or before. Works on Ubuntu 18.04 Bionic Beaver or Debian stable distributions.

```sh
# install husky
$ npm install -g husky
# it automatically lints during commits
$ git commit
...
```

## License

[GPL-3.0 or later](https://spdx.org/licenses/GPL-3.0-or-later)
© 2019 Decentralized Society Foundation, PA