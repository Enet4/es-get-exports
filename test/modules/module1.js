
export function add(a,b) {
    return a + b;
}

function identity(i) {
    return i;
}

function mult(a,b) {
    return a * b;
}

export {identity, mult as multiply};
export default 'wat';
export * from './module2';
 
