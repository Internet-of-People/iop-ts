#!/usr/bin/env bash

git checkout develop

declare -a packages=("did-manager" "examples" "hydra-plugin" "keyvault" "logger")

for package in "${packages[@]}"; do
    cd packages/$package
    echo $PWD
    npm publish --tag nightly
    cd ../..
done