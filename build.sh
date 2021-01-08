#!/bin/bash

# remove the old dist folder
rm -rf ./dist
# compile
tsc
# generate documentation
npx typedoc --out ./docs ./src --theme minimal --mode file --exclude /**/index.ts --excludePrivate --excludeExternals