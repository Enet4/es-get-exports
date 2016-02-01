import espree from 'espree';
import fs from 'fs';
import Path from 'path';
import resolveFrom from 'resolve-from';

function resolveModule(base, module) {
  const path = typeof base !== 'string' ? require.resolve(module) : resolveFrom(base, module);
  if (!path) {
    throw new Error("Cannot resolve module '" + module + "' from '" + base + "'");
  }
  return path;
}

function traverseExports(ast) {
    const l = [];
    return new Promise((resolve, reject) => {
        for (const node of ast.body) {
            const {type} = node;
            if (type === 'ExportSpecifier') {
                l.push(node.exported.name);
            } else if (type === 'ExportDefaultDeclaration') {
                l.push('default');
            } else if (type === 'ExportNamedDeclaration') {
                const {specifiers, declaration} = node;
                if (specifiers) {
                    for (const {exported} of specifiers) {
                        l.push(exported.name);
                    }
                }
                if (declaration) {
                    if (declaration.type === 'VariableDeclaration') {
                        for (const d of declaration.declarations) {
                            l.push(d.id.name);
                        }
                    } else if (declaration.type === 'FunctionDeclaration') {
                        l.push(declaration.id.name);
                    }
                }
            } else if (type === 'ExportAllDeclaration') {
                const {source} = node;
                const oModule = source.value;
                l.push({allFrom: oModule, toResolve: true});
            }
        }
        resolve(l);
    });
}

/**
 * @param {string} path
 * @return {Promise}
 */
function retrieveCode(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (error, content) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(content);
        })
    });
}

/**
 * @param {string} module
 * @param {{base: string, recursive: boolean}} options
 * @return {Promise}
 */
export default function getExports(module, {base, recursive = true}) {
    const espreeOpt = {
        range: false,
        loc: false,
        comments: false,
        attachComment: false,
        tokens: false,
        sourceType: 'module',
        ecmaVersion: 6
    };
    
    return new Promise((resolve, reject) => {
        const path = resolveModule(base, module);
        
        let pList = retrieveCode(path)
            .then((code) => traverseExports(espree.parse(code, espreeOpt)));
            
        if (recursive) {
            let mustRecurse;
            do {
                mustRecurse = false;
                pList = pList.then((list) => {
                    return Promise.all(list.map(e => {
                        if (typeof e === 'object' && e.allFrom && e.toResolve) {
                            const {allFrom} = e;
                            mustRecurse = true;
                            const base = Path.dirname(path);
                            return getExports(allFrom, {base, recursive: true})
                                .catch((reason) => (
                                    // failed to resolve, leaving an object placeholder
                                    {allFrom, failed: reason})
                                );
                        }
                        return e;
                    }));
                }).then((list) => [].concat.apply([], list));
            } while (mustRecurse);
        }
        resolve(pList);
    });
}
