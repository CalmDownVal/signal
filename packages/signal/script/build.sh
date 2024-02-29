#!/bin/bash

# assert correct working directory
DIR=$(pwd)
if [ $(cat "$DIR/package.json" | jq -r '.name') != "@cdv/signal" ]; then
	echo "invalid working directory"
	exit 1
fi

# prepare a clean build directory
mkdir -p "$DIR/build"
rm -r "$DIR/build/"* 2>/dev/null

# call rollup
yarn run --binaries-only rollup --config "$DIR/rollup.config.mjs"
