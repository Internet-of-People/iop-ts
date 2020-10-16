#!/usr/bin/env python3

import json
from os import listdir
from os.path import isdir, join
import subprocess


def readJson(path):
    with open(path, 'r') as jsonFile:
        jsonStr = jsonFile.read()
        return json.loads(jsonStr)

def rootPackagesDiff(category, rootDeps, packagesDeps, rootWhiteList):
    rootDepSet = set( rootDeps.keys() )
    packagesDepSet = set( [key for packageDeps in packagesDeps for (key, value) in packageDeps.items()] )
    missingInRoot = list(packagesDepSet - rootDepSet - rootWhiteList)
    unusedInRoot = list(rootDepSet - packagesDepSet - rootWhiteList)
    print("Missing", category, "in root:", json.dumps(missingInRoot, indent=2))
    if len(missingInRoot) > 0: exit(-1)
    print("Unused", category, "in root:", json.dumps(unusedInRoot, indent=2))
    if len(unusedInRoot) > 0: exit(-2)

def diffDependencies(category, root, packageList, rootWhiteList):
    packagesDeps = [ json.get(category, {}) for json in packageJsons ]
    rootPackagesDiff( category, root.get(category, {}), packagesDeps, rootWhiteList)

def runDepCheck(packageDirs):
    for packageDir in packageDirs:
        command = "npx depcheck --ignores='@types/jest,typescript,rimraf,eslint,jest' %s" % packageDir
        print("Running", command)
        result = subprocess.run(command, check=True, shell=True)

packagesDir = "packages"
packageDirs = [ join(packagesDir, entry) for entry in listdir(packagesDir) if isdir(join(packagesDir, entry)) ]
runDepCheck(packageDirs)

packageFilename = "package.json"
rootJson = readJson(packageFilename)
packagePaths = [ join(packageDir, packageFilename) for packageDir in packageDirs ]
packageJsons = [ readJson(path) for path in packagePaths ]

packageNames = [ packageJson["name"] for packageJson in packageJsons ]
diffDependencies("dependencies", rootJson, packageJsons, set(packageNames))
diffDependencies("devDependencies", rootJson, packageJsons, set(["lerna", "husky"]))
