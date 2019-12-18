# Morpheus

Morpheus is a decentralized identity system with an open ecosystem enabling verifiable claims in a
web-of-trust way. See the [specification](https://iop-stack.gitlab.iop-ventures.com/dids-and-claims/specification)
or check out the [whitepaper](https://iop.global/whitepaper/) where this fits.

Morpheus relies on the Hydra Blockchain and custom transactions to build a repository of DID documents.
These documents establish the identity of an entity even when using different cryptographic keys over time, and contain no personal identifiable information.
Personal data will be stored elsewhere (decided by the users and service providers), using the Morpheus DB for establishing validity of information. 
This way, Morpheus far exceeds the GDPR requirements.

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

[ ] Implicit DID Documents
[ ] Add/Revoke Key
[ ] Add/Revoke Right
[ ] Add/Remove Service Endpoint



## How to Build

### Prerequisites

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
$ npm --version
6.13.1
```

### Build

```bash
# Setup all dependencies
$ npm install
# Lint and build all packages
$ npm run build
# Run all tests
$ npm run test
...
lerna success - @internet-of-people/...
```

### Contributing

Feel free to open issues and send pull requests in this repository. By sending contributions, you are agreeing to transfer all intellectual property from your changes to the Decentralized Society Foundation, Panama, who owns the copyright of this code.

We are using a commit hook and quite strict linting rules for our codebase. Please install `husky` to check your commits before you send us pull requests. This requires git >= 2.13 so does not work on Ubuntu 16.04 Xenial Xerus or before. Works on Ubuntu 18.04 Bionic Beaver or Debian stable distributions.

```sh
# install husky
$ npm install -g husky
# it automatically lints during commits
$ git commit
...
```
