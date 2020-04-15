#!/usr/bin/env bash

git checkout master

declare -a packages=("sdk" "morpheus-crypto")

for package in "${packages[@]}"; do
    cd packages/$package
    echo $PWD
    npm publish
    cd ../..
done