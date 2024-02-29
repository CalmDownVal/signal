#!/bin/bash

# assert correct working directory
DIR=$(pwd)
if [ $(cat "$DIR/package.json" | jq -r '.name') != "@cdv/signal" ]; then
	echo "invalid working directory"
	exit 1
fi

# tag the version
VER=$(cat "$DIR/package.json" | jq -r '.version')
git tag "v$VER"
if [ $? -ne 0 ]; then
	echo "failed to tag v$VER"
	exit 1
fi

# (re-)build first
"$DIR/script/build.sh"

# prepare a clean publish directory
mkdir -p "$DIR/publish"
rm -r "$DIR/publish/"* 2>/dev/null

# copy files
cp -r "$DIR/build" "$DIR/publish"
cp "$DIR/../../readme.md" "$DIR/publish"
cat "$DIR/package.json" | jq 'del(.devDependencies, .scripts)' | unexpand -t2 > "$DIR/publish/package.json"

# publish
(cd "$DIR/publish"; npm publish --access public)
