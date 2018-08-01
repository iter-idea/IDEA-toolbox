# IDEA's toolbox

Utility functions to support iter IDEA's projects.

## Installation

`npm install idea-toolbox`

## Usage

Javascript
```
const Idea = require('idea-toolbox');
```
Typescript
```
import Idea = require('idea-toolbox');
```

## Documentation

Documentation generated with TypeDoc: [link](https://uatisdeproblem.github.io/IDEA-toolbox).

## Notes

- The AWS-SDK is a back-end only package, which is already pre-installed in any Lambda Function;
therefore, we included it as devDependency. This to avoid errors on client side, due to some 
webpackage missing.