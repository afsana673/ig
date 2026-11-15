'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const GroupManager = require('../');

test('delegates getPending to configured adapter method', async () => {
  const api = { listInvites: async () => [{ id: 'a' }] };
  const manager = new GroupManager(api, { methods: { getPending: 'listInvites' } });
  assert.deepEqual(await manager.getPending(), [{ id: 'a' }]);
});

test('accepts and rejects using configured methods', async () => {
  const calls = [];
  const api = {
    approve: async id => calls.push(['approve', id]),
    decline: async id => calls.push(['decline', id])
  };
  const manager = new GroupManager(api, {
    methods: { accept: 'approve', reject: 'decline' }
  });
  await manager.accept('x');
  await manager.reject('y');
  assert.deepEqual(calls, [['approve', 'x'], ['decline', 'y']]);
});

test('bulk action processes each invitation', async () => {
  const calls = [];
  const api = {
    approve: async id => { calls.push(id); return true; }
  };
  const manager = new GroupManager(api, { methods: { accept: 'approve' } });
  const result = await manager.acceptAll([{ id: 'a' }, { id: 'b' }]);
  assert.deepEqual(calls, ['a', 'b']);
  assert.equal(result.every(item => item.success), true);
});

test('throws helpful error for unconfigured adapter method', async () => {
  const manager = new GroupManager({});
  await assert.rejects(() => manager.getPending(), /was not found/);
});
