import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveTestShard, selectTestShard } from './test-sharding.js';

const files = ['zeta.test.ts', 'alpha.test.ts', 'middle.test.ts', 'beta.test.ts'];

test('one shard receives every file', () => {
  assert.deepEqual(selectTestShard(files, resolveTestShard({ TEST_SHARD_INDEX: '0', TEST_SHARD_COUNT: '1' })), [
    'alpha.test.ts',
    'beta.test.ts',
    'middle.test.ts',
    'zeta.test.ts',
  ]);
});

test('files are deterministically distributed in sorted order', () => {
  const shard = resolveTestShard({ TEST_SHARD_INDEX: '1', TEST_SHARD_COUNT: '2' });

  assert.deepEqual(selectTestShard(files, shard), ['beta.test.ts', 'zeta.test.ts']);
  assert.deepEqual(selectTestShard([...files].reverse(), shard), ['beta.test.ts', 'zeta.test.ts']);
});

test('every file belongs to exactly one shard', () => {
  const assignments = [0, 1, 2].flatMap(index =>
    selectTestShard(files, resolveTestShard({ TEST_SHARD_INDEX: String(index), TEST_SHARD_COUNT: '3' }))
  );

  assert.deepEqual([...new Set(assignments)].sort(), [...files].sort());
  assert.equal(assignments.length, files.length);
});

test('invalid shard values fail clearly', () => {
  assert.throws(
    () => resolveTestShard({ TEST_SHARD_INDEX: '0' }),
    /TEST_SHARD_INDEX and TEST_SHARD_COUNT must be set together/
  );
  assert.throws(
    () => resolveTestShard({ TEST_SHARD_INDEX: 'two', TEST_SHARD_COUNT: '3' }),
    /TEST_SHARD_INDEX must be a non-negative integer/
  );
  assert.throws(
    () => resolveTestShard({ TEST_SHARD_INDEX: '0', TEST_SHARD_COUNT: '0' }),
    /TEST_SHARD_COUNT must be greater than 0/
  );
  assert.throws(
    () => resolveTestShard({ TEST_SHARD_INDEX: '2', TEST_SHARD_COUNT: '2' }),
    /TEST_SHARD_INDEX must be less than TEST_SHARD_COUNT/
  );
});
