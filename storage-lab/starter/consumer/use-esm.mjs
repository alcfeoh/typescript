// A consumer using ESM — the way a Vite / Next / modern Node app imports you.
import './localstorage-stub.mjs';
import assert from 'node:assert/strict';
import { Storage } from '@formation-ts/typed-storage';

const storage = new Storage('question');
assert.equal(storage.load(), null);

storage.save({ id: 1, text: 'What is keyof?' });
assert.deepEqual(storage.load(), { id: 1, text: 'What is keyof?' });

storage.delete();
assert.equal(storage.load(), null);

console.log('ESM consumer: ok');
