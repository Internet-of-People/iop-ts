# Morpheus

Blurb

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
