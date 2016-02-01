[![version](https://img.shields.io/npm/v/es-get-exports.svg)](https://www.npmjs.org/package/es-get-exports)

# ECMAScript 2015 getExports

Retrieve a list of export names from an ECMAScript 2015 module file in Node.js, without evaluating the module.

## Usage

Given the following module in 'my/module':

```javascript
export function hello() {
    return "Hello!";
}

const YES_CONSTANT = 'YES';
const NO_CONSTANT = 'NO';

export {YES_CONSTANT, NO_CONSTANT};
export default 42;
```

This code with retrieve the names of all exports:

```javascript
import {getExports} from 'es-get-exports';

getExports('./my/module', {base: __dirpath})
    .then((list) => {
        console.log(list); // ['hello', 'YES_CONSTANT', 'NO_CONSTANT', 'default']
    });

```

Note: This version will only work for Harmony ECMAScript modules. CommonJS modules will yield an empty list.

## API

```javascript
function getExports(module:string, {base: string, recursive: boolean})
                  : Promise<(string|object)[]>
```

Returns a standard Promise containing a list of strings (may contain object placeholders iff the `recursive` option is false.

### Options

 - _base_ : The relative directory path for resolving the module file. When relative to the caller module's directory, simply assign this to `__dirpath`.
 - _recursive_ : [default is true] whether to resolve `import * from` statements recursively. If false, a placeholder object `{allFrom: string, toResolve = true}` is added to the list and no further resolution is made.

## License

MIT
