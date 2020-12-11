#!/bin/bash

# lint the codebase
yarn eslint ./src

# make sure there's an empty build directory available
mkdir -p ./build
rm -rf ./build/*

# build the script files
yarn tsc --project ./config/tsconfig.cjs.json
yarn tsc --project ./config/tsconfig.mjs.json
mv ./build/mjs/index.js ./build/mjs/index.mjs
