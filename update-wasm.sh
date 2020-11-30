#!/usr/bin/env bash

function replace_json() {
    json_file=$1
    version=$2
    sed -i -E 's#^(\s*"@internet-of-people/sdk-wasm"\s*:\s*)".+"#\1"'"$version"'"#g' "$json_file"
}

cp -rf ../morpheus-rust/sdk-wasm/pkg/* packages/sdk-wasm/

version=$(jq -r .version < packages/sdk-wasm/package.json)
declare -a dependent_packages=("coeus-node" "coeus-proto" "morpheus-crypto" "sdk")
for dependent_package in "${dependent_packages[@]}"; do
    replace_json "packages/$dependent_package/package.json" "$version"
done
