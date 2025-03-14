const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Base directory for all database files
const DB_DIR = path.join(process.cwd(), 'localdb');

/**
 * Generate a unique ID with optional prefix
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} A unique ID
 */
function generateId(prefix = '') {
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(4).toString('hex');
  return `${prefix}${timestamp}_${randomStr}`;
}

/**
 * Read a collection file
 * @param {string} collection - Collection name
 * @returns {Promise<Object>} The collection data
 */
async function readCollection(collection) {
  try {
    const filePath = path.join(DB_DIR, `${collection}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // If file doesn't exist, create an empty collection
      const emptyCollection = { [collection]: [] };
      await writeCollection(collection, emptyCollection);
      return emptyCollection;
    }
    throw err;
  }
}

/**
 * Write data to a collection file
 * @param {string} collection - Collection name
 * @param {Object} data - Data to write
 * @returns {Promise<void>}
 */
async function writeCollection(collection, data) {
  const filePath = path.join(DB_DIR, `${collection}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Get all documents from a collection
 * @param {string} collection - Collection name
 * @returns {Promise<Array>} Array of documents
 */
async function getAll(collection) {
  const data = await readCollection(collection);
  return data[collection] || [];
}

/**
 * Get a document by ID
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>} The document or null if not found
 */
async function getById(collection, id) {
  const data = await readCollection(collection);
  return data[collection]?.find(item => item._id === id) || null;
}

/**
 * Find documents by query
 * @param {string} collection - Collection name
 * @param {Object} query - Query object
 * @returns {Promise<Array>} Array of matching documents
 */
async function find(collection, query) {
  const data = await readCollection(collection);
  
  return data[collection]?.filter(item => {
    return Object.entries(query).every(([key, value]) => {
      return item[key] === value;
    });
  }) || [];
}

/**
 * Create a new document
 * @param {string} collection - Collection name
 * @param {Object} document - Document to create
 * @returns {Promise<Object>} The created document
 */
async function create(collection, document) {
  const data = await readCollection(collection);
  const now = new Date().toISOString();
  
  // Generate ID if not provided
  const newDocument = {
    _id: document._id || generateId(collection.slice(0, 3) + '_'),
    ...document,
    createdAt: now,
    updatedAt: now
  };
  
  data[collection].push(newDocument);
  await writeCollection(collection, data);
  return newDocument;
}

/**
 * Update a document
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @param {Object} update - Fields to update
 * @returns {Promise<Object|null>} The updated document or null if not found
 */
async function update(collection, id, update) {
  const data = await readCollection(collection);
  const index = data[collection]?.findIndex(item => item._id === id);
  
  if (index === -1 || index === undefined) return null;
  
  const now = new Date().toISOString();
  data[collection][index] = {
    ...data[collection][index],
    ...update,
    updatedAt: now
  };
  
  await writeCollection(collection, data);
  return data[collection][index];
}

/**
 * Delete a document
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<boolean>} True if document was deleted, false otherwise
 */
async function remove(collection, id) {
  const data = await readCollection(collection);
  const initialLength = data[collection]?.length || 0;
  
  if (data[collection]) {
    data[collection] = data[collection].filter(item => item._id !== id);
    if (data[collection].length !== initialLength) {
      await writeCollection(collection, data);
      return true;
    }
  }
  
  return false;
}

// Initialize the database directory if it doesn't exist
async function init() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    console.log(`LocalDB initialized at ${DB_DIR}`);
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Initialize on import
init();

module.exports = {
  getAll,
  getById,
  find,
  create,
  update,
  delete: remove,
  generateId
};