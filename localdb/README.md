# LocalDB

This directory serves as a local database using JSON files, structured in a way that will make migration to MongoDB easier in the future.

## Structure

- Each collection is stored in its own JSON file
- Files follow MongoDB-like schema patterns
- All documents have a unique `_id` field
- Timestamps (`createdAt`, `updatedAt`) are included for all documents

## Available Collections

- `users.json` - User accounts
- `businesses.json` - Business entities
- `feeds.json` - Product feeds
- `pixels.json` - Tracking pixels
- `products.json` - Product catalog

## Usage

Use the db.js utility to interact with these collections:

```javascript
const db = require('../utils/db');

// Get all users
const users = await db.getAll('users');

// Get user by ID
const user = await db.getById('users', 'user_123');

// Create user
const newUser = await db.create('users', { name: 'John', email: 'john@example.com' });

// Update user
await db.update('users', 'user_123', { name: 'John Updated' });

// Delete user
await db.delete('users', 'user_123');
```