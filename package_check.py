#!/usr/bin/env python3

"""Command-line utility to check if the root package.json used by lerna has dependencies if and
only if they are in any of the actual npm packages"""

import json
import sys
from os import listdir
from os.path import isdir, join
import subprocess


def read_json(path):
    """Loads file with path as JSON into a python object"""
    with open(path, 'r') as json_file:
        json_str = json_file.read()
        return json.loads(json_str)

def diff_dependencies(category, root, root_whitelist):
    """Compares a category of dependencies between the root package and the union of all other
    packages"""
    root_deps = root.get(category, {})
    packages_deps = [json.get(category, {}) for json in PACKAGE_JSONS]

    root_dep_set = set(root_deps.keys())
    packages_dep_set = {key for package_deps in packages_deps
                        for (key, value) in package_deps.items()}

    missing_in_root = list(packages_dep_set - root_dep_set - root_whitelist)
    print("Missing", category, "in root:", json.dumps(missing_in_root, indent=2))
    if len(missing_in_root) > 0:
        sys.exit(-1)

    unused_in_root = list(root_dep_set - packages_dep_set - root_whitelist)
    print("Unused", category, "in root:", json.dumps(unused_in_root, indent=2))
    if len(unused_in_root) > 0:
        sys.exit(-2)

def run_dep_check():
    """Runs the depcheck binary on each package in the monorepo"""
    ignores = ["@types/jest", "typescript", "rimraf", "eslint", "jest", "tslib"]
    for package_dir in PACKAGE_DIRS:
        command = "npx depcheck --ignores='%s' %s" % (",".join(ignores), package_dir)
        print("Running", command)
        subprocess.run(command, check=True, shell=True)

PACKAGES_DIR = "packages"
PACKAGE_DIRS = [join(PACKAGES_DIR, entry) for entry in listdir(PACKAGES_DIR)
                if isdir(join(PACKAGES_DIR, entry))]
run_dep_check()

PACKAGE_FILENAME = "package.json"
ROOT_JSON = read_json(PACKAGE_FILENAME)
PACKAGE_PATHS = [join(package_dir, PACKAGE_FILENAME) for package_dir in PACKAGE_DIRS]
PACKAGE_JSONS = [read_json(path) for path in PACKAGE_PATHS]

PACKAGE_NAMES = [package_json["name"] for package_json in PACKAGE_JSONS]
diff_dependencies("dependencies", ROOT_JSON, set(PACKAGE_NAMES))
diff_dependencies("devDependencies", ROOT_JSON, set(["lerna", "husky"]))
