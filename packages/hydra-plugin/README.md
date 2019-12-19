# Hydra Morpheus Plugin

This is the Morpheus plugin for the Hydra Blockchain.

## Table of Contents <!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#Usage)

## Prerequisites

You have a cloned out [hydra-core](https://github.com/Internet-of-People/hydra-core)
repo, where you've ran `yarn setup`.

Note: until Morpheus is live, you must clone out the `aip29` branch.

## Installation

There is no such steps you have to follow. The plugin has only one requirement that has to be done.

You have to add the following lines into the `plugins.js` file:
```javascript
// Example options
"@internet-of-people/morpheus-hydra-plugin": {
    
}
```

If you are not sure where is your `plugins.js` file and you **have not modified** it, you can reset it which will put these lines to the right place:
```bash
./packages/core/bin/run config:reset --network=[testnet|devnet|mainnet]
```

## Usage

The plugin provides some endpoints where you can query the Layer 2 consensus.
Please see the [architecture section in the specification](https://iop-stack.gitlab.iop-ventures.com/dids-and-claims/specification/#/architecture) for the exact endpoints.

**Important Notes:**
- These endpoints are NOT yet available: `getOperations`, `getOperationAttempts`
- The API is currently servered at port `4705`. Soon it will use the same wallet API port as used for other APIs. 
So an example URL you can curl: `curl http://127.0.0.1:4705/before-proof/iop/exists/780`