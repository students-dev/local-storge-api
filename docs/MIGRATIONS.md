# Migrations

**Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi**

## Overview

The Local Storage API includes a comprehensive migration system for handling schema changes, data transformations, and version upgrades.

## Migration Concepts

### Schema Versions
Each stored item includes a version number that tracks its schema version:

```javascript
{
  key: "user:123",
  value: { name: "Alice", email: "alice@example.com" },
  version: 2,
  createdAt: 1640995200000,
  updatedAt: 1640995200000
}
```

### Migration Registry
Migrations are registered functions that transform data from one version to another:

```javascript
storage.registerMigration('User', 1, 2, (data) => {
  // Transform v1 to v2
  return {
    ...data,
    fullName: `${data.firstName} ${data.lastName}`,
    firstName: undefined,
    lastName: undefined
  };
});
```

## Migration Types

### Automatic Migrations
Triggered when loading data with an outdated version:

```javascript
// Data stored with version 1
const oldData = await storage.get('user:123');
// Automatically migrated to version 2
console.log(oldData.version); // 2
```

### Manual Migrations
Executed explicitly for bulk transformations:

```javascript
await storage.migrateModel('User', 1, 2);
```

### Incremental Migrations
Complex migrations can be broken into steps:

```javascript
storage.registerMigration('Product', 1, 2, (data) => ({
  ...data,
  category: data.category || 'uncategorized'
}));

storage.registerMigration('Product', 2, 3, (data) => ({
  ...data,
  tags: Array.isArray(data.tags) ? data.tags : []
}));
```

## Migration API

### Registering Migrations

```javascript
// Register a migration for a model
storage.registerMigration(modelName, fromVersion, toVersion, migrationFn);

// Register a global migration
storage.registerGlobalMigration(fromVersion, toVersion, migrationFn);
```

### Executing Migrations

```javascript
// Migrate all items of a model
await storage.migrateModel('User', 1, 2);

// Migrate specific key
await storage.migrateKey('user:123', 2);

// Run all pending migrations
await storage.runMigrations();
```

### Migration Status

```javascript
// Check migration status
const status = storage.getMigrationStatus();
console.log(status);
// {
//   'User': { current: 3, latest: 3, pending: [] },
//   'Product': { current: 1, latest: 2, pending: [2] }
// }
```

## Migration Strategies

### Backward Compatibility
Migrations ensure old data can be read with new code:

```javascript
// Old code expects 'firstName' + 'lastName'
const user = await storage.get('user:123');
// Migration automatically provides backward compatibility
console.log(user.firstName); // Still works
console.log(user.fullName);  // New field available
```

### Data Transformation
Migrations can perform complex transformations:

```javascript
storage.registerMigration('Order', 1, 2, (data) => {
  const transformed = { ...data };

  // Normalize currency
  if (data.currency === 'USD') {
    transformed.amount = data.amount * 100; // Convert to cents
  }

  // Flatten nested structure
  if (data.customer) {
    transformed.customerId = data.customer.id;
    transformed.customerName = data.customer.name;
    delete transformed.customer;
  }

  return transformed;
});
```

### Validation Integration
Migrations can include validation:

```javascript
storage.registerMigration('User', 1, 2, (data) => {
  const migrated = { ...data };

  // Add default values
  migrated.role = migrated.role || 'user';
  migrated.createdAt = migrated.createdAt || Date.now();

  // Validate email format
  if (!isValidEmail(migrated.email)) {
    throw new MigrationError(`Invalid email: ${migrated.email}`);
  }

  return migrated;
});
```

## Migration Safety

### Transactional Migrations
Migrations run within transactions to ensure atomicity:

```javascript
// Migration either succeeds completely or fails completely
await storage.migrateModel('User', 1, 2);
// No partial state left behind
```

### Rollback Support
Failed migrations can be rolled back:

```javascript
try {
  await storage.migrateModel('User', 1, 2);
} catch (error) {
  await storage.rollbackMigration('User', 1, 2);
}
```

### Dry Run Mode
Test migrations without applying changes:

```javascript
const changes = await storage.dryRunMigration('User', 1, 2);
console.log('Would migrate:', changes.length, 'items');
```

## Migration Hooks

### Before/After Hooks
```javascript
storage.onMigrationStart((model, from, to) => {
  console.log(`Starting migration: ${model} ${from} -> ${to}`);
});

storage.onMigrationComplete((model, from, to, count) => {
  console.log(`Migrated ${count} items: ${model} ${from} -> ${to}`);
});

storage.onMigrationError((model, from, to, error) => {
  console.error(`Migration failed: ${model} ${from} -> ${to}`, error);
});
```

## Advanced Migration Features

### Conditional Migrations
```javascript
storage.registerMigration('Product', 1, 2, (data) => {
  // Only migrate products created before a certain date
  if (data.createdAt < Date.parse('2023-01-01')) {
    return { ...data, legacy: true };
  }
  return data;
});
```

### Batch Migrations
```javascript
storage.registerBatchMigration('Log', 1, 2, async (items) => {
  // Process items in batches for performance
  const batchSize = 100;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    // Process batch
    await processBatch(batch);
  }
});
```

### Cross-Model Migrations
```javascript
storage.registerCrossModelMigration('User+Order', 1, 2, async () => {
  // Migrate related data across multiple models
  const users = await storage.query('User').execute();
  const orders = await storage.query('Order').execute();

  // Complex cross-referencing logic
  return migrateUserOrders(users, orders);
});
```

## Migration Testing

### Unit Tests
```javascript
test('migration transforms data correctly', () => {
  const migration = storage.getMigration('User', 1, 2);
  const input = { firstName: 'John', lastName: 'Doe' };
  const output = migration(input);

  expect(output.fullName).toBe('John Doe');
  expect(output.firstName).toBeUndefined();
});
```

### Integration Tests
```javascript
test('migration preserves data integrity', async () => {
  // Insert test data
  await storage.save('user:1', { firstName: 'John', lastName: 'Doe' });

  // Run migration
  await storage.migrateModel('User', 1, 2);

  // Verify data
  const user = await storage.load('user:1');
  expect(user.fullName).toBe('John Doe');
  expect(user.version).toBe(2);
});
```

## Migration Best Practices

### Version Numbering
- Use semantic versioning (major.minor.patch)
- Increment major version for breaking changes
- Increment minor version for additive changes
- Increment patch version for bug fixes

### Migration Naming
- Use descriptive names: `add-user-avatar`, `normalize-addresses`
- Include version numbers: `user-v1-to-v2`
- Group related migrations: `user-profile-updates`

### Performance Considerations
- Test migrations with large datasets
- Use batching for bulk operations
- Consider downtime for complex migrations
- Monitor memory usage during migration

### Error Handling
- Always validate input data
- Provide clear error messages
- Log migration progress
- Have rollback plans

## Migration CLI

```bash
# List pending migrations
local-storage-api migrations list

# Run all pending migrations
local-storage-api migrations run

# Run specific migration
local-storage-api migrations run User 1 2

# Dry run migration
local-storage-api migrations dry-run User 1 2

# Rollback migration
local-storage-api migrations rollback User 1 2
```

## Migration Monitoring

### Metrics
- Migration duration
- Items processed per second
- Error rates
- Rollback frequency

### Logging
- Migration start/end events
- Item-level transformation logs
- Error details and stack traces

### Alerts
- Failed migrations
- Long-running migrations
- High error rates