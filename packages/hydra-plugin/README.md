# Hydra DAC (Project Morpheus) Plugin

This is the DAC plugin for the Hydra Blockchain.

## Table of Contents <!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)

## Prerequisites

You have a cloned out [hydra-core](https://github.com/Internet-of-People/hydra-core)
repo, where you've ran `yarn setup`.

## Installation

There is no such steps you have to follow. The plugin has only one requirement that has to be done.

You have to add the following lines into the `plugins.js` file:

```javascript
// Example options
"@internet-of-people/morpheus-hydra-plugin": {}
```

If you are not sure where is your `plugins.js` file and you **have not modified** it, you can reset it which will put these lines to the right place:

```bash
./packages/core/bin/run config:reset --network=[testnet|devnet|mainnet]
```

## Usage

The plugin provides some endpoints where you can query the Layer 2 consensus.
Please see the [architecture section in the specification](https://iop-stack.iop.rocks/dids-and-claims/specification/#/architecture) for the exact endpoints.

An example URL you can curl: `curl http://127.0.0.1:4703/before-proof/iop/exists/780`

## Check also

Please read about maintainers, contribution contract at <https://github.com/Internet-of-People/morpheus-ts>