var getExports = require('..');
var mocha = require('mocha');
var assert = require('assert');
var it = mocha.it;
var describe = mocha.describe;

var MODULE1_NAMES = ['add', 'multiply', 'identity', 'default'];
var ALL_NAMES = ['add', 'multiply', 'identity', 'default', 'negate', 'YES'];

describe("GET exports from module1", function() {
  it("should retrieve 5 exports when not recursive", function(done) {
    getExports('./modules/module1', {base: __dirname, recursive: false})
      .then(function(list) {
        assert.ok(list instanceof Array);
        assert.equal(list.length, 5);
        list.forEach(function(name) {
            if (typeof name === 'object') {
              //  {allFrom: './module2', toResolve: true}
              assert.equal(name.allFrom, './module2');
              assert(name.toResolve);
            } else {
              assert.ok(MODULE1_NAMES.indexOf(name) !== -1, "export \"" + name + "\"");
            }
        });
      done();
    }).catch(function(error) {
      process.nextTick(function() {
          throw error;
      });
    });
  });

  it("should retrieve all 6 exports when recursive", function(done) {
    getExports('./modules/module1', {base: __dirname, recursive: true})
      .then(function(list) {
        assert.ok(list instanceof Array);
        assert.equal(list.length, 6);
        list.forEach(function(name) {
            assert.ok(ALL_NAMES.indexOf(name) !== -1, "export \"" + name + "\"");
        });
      done();
    }).catch(function(error) {
      process.nextTick(function() {
          throw error;
      });
    });
  });
});

describe("GET exports from nomodule", function() {
  it("should provide a rejected promise", function(done) {
    
    getExports('./modules/nomodule', {base: __dirname, recursive: true})
      .then(function() {
          process.nextTick(function() {
              assert.fail("should not resolve!");
          });
      done();
    }).catch(function(error) {
        assert(error.message.indexOf("Cannot resolve module './modules/nomodule'") === 0);
        done();
    });
  });
});
