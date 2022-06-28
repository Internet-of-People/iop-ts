#!/usr/bin/env python3

"""This is a small CLI tool to copy a freshly built WASM packages from a root folder
   (say ../iop-rs) to the corresponding folders in this monorepo and update all TypeScript
   packages depending on them to use those versions"""

import json
from shutil import rmtree, copytree
from os import listdir
from os.path import isdir, join

WASM_ROOT = "../iop-rs"
WASM_PACKAGES = ["sdk-wasm", "node-wasm"]
PACKAGES_DIR = "packages"
PACKAGE_DIRS = [join(PACKAGES_DIR, entry) for entry in listdir(PACKAGES_DIR)
                if isdir(join(PACKAGES_DIR, entry))]

def read_json(path):
    """Reads a whole JSON file into a python object"""
    with open(path, 'r') as json_file:
        json_str = json_file.read()
        return json.loads(json_str)

def write_json(path, obj):
    """Writes a python object into a JSON file"""
    with open(path, 'w') as json_file:
        json_str = json.dumps(obj, ensure_ascii=False, allow_nan=False, indent=2)
        json_file.write(json_str)

def update_in_tag(package_json, tag, dep_name, version):
    """Updates the version of a given package among a given type of dependencies (dev or normal)"""
    dirty = False
    deps = package_json.get(tag, {})
    if dep_name in deps:
        print(f"- {tag}/{dep_name} set to {version}")
        deps[dep_name] = version
        dirty = True
    return dirty

def update_dependents(dep_name, version):
    """Updates the version of a given dependency in all packages in this monorepo"""
    for package_dir in PACKAGE_DIRS:
        package_json_path = join(package_dir, "package.json")
        package_json = read_json(package_json_path)
        dirty1 = update_in_tag(package_json, "dependencies", dep_name, version)
        dirty2 = update_in_tag(package_json, "devDependencies", dep_name, version)
        if dirty1 or dirty2:
            print(f"in {package_json_path}")
            write_json(package_json_path, package_json)

def update_wasm_packages():
    """Copies over the WASM packages and updates dependent packages to use their new version"""
    for wasm_package in WASM_PACKAGES:
        wasm_package_dir = join(PACKAGES_DIR, wasm_package)
        rmtree(wasm_package_dir)
        copytree(join(WASM_ROOT, wasm_package, "pkg/"), wasm_package_dir)
    for wasm_package in WASM_PACKAGES:
        wasm_package_dir = join(PACKAGES_DIR, wasm_package)
        package_json = read_json(join(wasm_package_dir, "package.json"))
        version = package_json.get("version")
        dep_name = f"@internet-of-people/{wasm_package}"
        update_dependents(dep_name, version)

update_wasm_packages()
