# Hydra Layer-2 Plugin

This is the IOP layer-2 plugin for the Hydra Blockchain. It loads up IOP's layer-2 solutions: IOP SSI (project Morpheus) and IOP NS (project Coeus).

This plugin provides some endpoints as well where you can query the layer-2 consensus.
Please see the [architecture section in the specification](https://developer.iop.global/get_started) for the exact endpoints.

An example URL you can curl: `curl http://127.0.0.1:4703/before-proof/iop/exists/780`

## Table of Contents <!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Installation](#installation)

## Prerequisites

You have a cloned out [hydra-core](https://github.com/Internet-of-People/hydra-core)
repo, where you've ran `yarn setup`.

## Installation

There only step to be done is to add the following lines into the `plugins.js` file:

```javascript
// Example options
"@internet-of-people/hydra-plugin": {}
```

If you are not sure where is your `plugins.js` file and you **have not modified** it, you can reset it which will put these lines to the right place:

```bash
./packages/core/bin/run config:reset --network=[testnet|devnet|mainnet]
```

## Check also

Please read about maintainers, contribution contract at <https://github.com/Internet-of-People/morpheus-ts>