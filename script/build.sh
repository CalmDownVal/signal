#!/bin/bash

# lint the codebase
yarn eslint ./src

# make sure there's an empty dist directory available
mkdir -p ./dist
rm -rf ./dist/*

# build the script files
yarn tsc --project ./config/tsconfig.cjs.json
yarn tsc --project ./config/tsconfig.mjs.json
mv ./dist/mjs/signal.js ./dist/mjs/signal.mjs
