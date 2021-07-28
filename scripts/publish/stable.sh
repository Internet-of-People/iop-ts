#!/usr/bin/env bash

declare -a packages=("sdk-wasm" "node-wasm" "morpheus-crypto" "hydra-plugin-core" "coeus-proto" "coeus-node" "did-manager" "sdk" "hydra-plugin")

npm config set registry https://registry.npmjs.org/

npm run clean
npm install
npm run build

for package in "${packages[@]}"; do
    cd packages/$package
    echo $PWD
    npm publish
    cd ../..
done