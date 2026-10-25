import test from 'node:test';
import assert from 'node:assert/strict';
import { nameKey } from './core.mjs';
test('normalizes athlete identities', () => assert.equal(nameKey('José Rodríguez Jr.'), 'joserodriguez'));
