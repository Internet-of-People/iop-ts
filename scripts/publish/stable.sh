#!/usr/bin/env bash

declare -a packages=("morpheus-crypto-wasm" "morpheus-crypto" "did-manager" "sdk" "hydra-plugin")

for package in "${packages[@]}"; do
    cd packages/$package
    echo $PWD
    npm publish
    cd ../..
done