# Hydra Morpheus Plugin

This is Morpheus plugin for the Hydra Blockchain.

## Table of Contents <!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Installation](#installation)

## Prerequisites

You have a cloned out [hydra-core](https://github.com/Internet-of-People/hydra-core)
repo, where you've ran `yarn setup`.

## Installation

1. Clone out this repository to `hydra-core/plugins`.
2. Run `yarn bootstrap` in the hydra-core's root.
3. Add `@internet-of-people/morpheus-hydra-plugin` to your used `plugins.js` file.
4. Fill out the plugin's options:

    ```javascript
    // Example options
    "@internet-of-people/morpheus-hydra-plugin": {
      
    }
    ```

5. Build the plugin with `yarn build` under your plugin's root.
6. Start the core.