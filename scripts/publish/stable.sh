#!/usr/bin/env bash

declare -a packages=("morpheus-crypto-wasm" "sdk-wasm" "morpheus-crypto" "hydra-plugin-core" "coeus-proto" "coeus-node" "did-manager" "sdk" "hydra-plugin")

for package in "${packages[@]}"; do
    cd packages/$package
    echo $PWD
    npm publish
    cd ../..
done