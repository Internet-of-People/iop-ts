#!/usr/bin/env bash

git checkout develop

declare -a packages=("did-manager" "examples" "hydra-plugin" "keyvault" "logger" "sdk" "morpheus-core")

for package in "${packages[@]}"; do
    cd packages/$package
    echo $PWD
    npm publish --tag nightly
    cd ../..
done