#!/usr/bin/env bash

git checkout develop

declare -a packages=("sdk" "morpheus-crypto")

for package in "${packages[@]}"; do
    cd packages/$package
    echo $PWD
    npm publish --tag nightly
    cd ../..
done