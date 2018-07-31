#!/bin/bash

# removed old dist folder
rm -r ./dist
# compile Typescript
tsc
# generate documentation
typedoc --out ./docs ./src --theme minimal --mode file --exclude /**/index.ts --excludePrivate --excludeExternals