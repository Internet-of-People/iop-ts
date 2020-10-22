#!/usr/bin/env bash

declare -a packages=("sdk-wasm" "morpheus-crypto" "hydra-plugin-core" "coeus-proto" "coeus-node" "did-manager" "sdk" "hydra-plugin")

npm install
npm run build
npm set registry https://npm.iop.global/

for package in "${packages[@]}"; do
    cd packages/$package
    echo $PWD
    npm unpublish --registry https://npm.iop.global/ --force > /dev/null 2>&1
    npm publish --registry https://npm.iop.global/
    cd ../..
done