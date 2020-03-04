#!/usr/bin/env bash

git checkout master

declare -a packages=("did-manager" "examples" "hydra-plugin" "keyvault" "logger","sdk")

for package in "${packages[@]}"; do
    cd packages/$package
    echo $PWD
    npm publish --tag stable
    cd ../..
done