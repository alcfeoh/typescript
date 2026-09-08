// A consumer using CommonJS — the way a Jest test or an older Node service
// still requires you today.
require('./localstorage-stub.cjs');
const assert = require('node:assert/strict');
const { Storage } = require('@formation-ts/typed-storage');

const storage = new Storage('question');
assert.equal(storage.load(), null);

storage.save({ id: 2, text: 'What is infer?' });
assert.deepEqual(storage.load(), { id: 2, text: 'What is infer?' });

console.log('CJS consumer: ok');
