/**
 * Parse and apply deterministic file-based test sharding.
 *
 * Files are sorted before assigning them round-robin to shards. Keeping this
 * logic independent from Web Test Runner makes the partitioning easy to test
 * without starting browser sessions.
 */
export function resolveTestShard(environment = process.env) {
  const indexValue = environment.TEST_SHARD_INDEX;
  const countValue = environment.TEST_SHARD_COUNT;

  if (indexValue === undefined && countValue === undefined) {
    return { index: 0, count: 1, label: 'unsharded' };
  }

  if (indexValue === undefined || countValue === undefined) {
    throw new Error('TEST_SHARD_INDEX and TEST_SHARD_COUNT must be set together');
  }

  const index = parseShardValue('TEST_SHARD_INDEX', indexValue);
  const count = parseShardValue('TEST_SHARD_COUNT', countValue);

  if (count < 1) {
    throw new Error('TEST_SHARD_COUNT must be greater than 0');
  }
  if (index >= count) {
    throw new Error('TEST_SHARD_INDEX must be less than TEST_SHARD_COUNT');
  }

  return { index, count, label: `shard-${index}-of-${count}` };
}

export function selectTestShard(files, shard = resolveTestShard()) {
  const sortedFiles = [...files].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  return sortedFiles.filter((_, fileIndex) => fileIndex % shard.count === shard.index);
}

function parseShardValue(name, value) {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${name} must be a non-negative integer; received "${value}"`);
  }

  const parsedValue = Number(value);
  if (!Number.isSafeInteger(parsedValue)) {
    throw new Error(`${name} must be a safe integer; received "${value}"`);
  }

  return parsedValue;
}
