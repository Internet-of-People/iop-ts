#!/usr/bin/env bash

declare -a packages=("sdk-wasm" "node-wasm" "morpheus-crypto" "hydra-plugin-core" "coeus-proto" "coeus-node" "did-manager" "sdk" "hydra-plugin")

npm set registry https://npm.iop.technology/

for package in "${packages[@]}"; do
    cd packages/$package
    echo $PWD
    npm unpublish --registry https://npm.iop.technology/ --force > /dev/null 2>&1
    npm publish --registry https://npm.iop.technology/
    cd ../..
done