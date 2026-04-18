const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database');
const { seedRBAC } = require('./seeders/rbacSeeder');

// Function to execute SQL file
async function executeSQLFile(filePath) {
  try {
    const sql = await fs.readFile(filePath, 'utf8');
    console.log(`Running ${path.basename(filePath)}`);
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.exec(sql, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  } catch (error) {
    throw new Error(`Failed to execute ${filePath}: ${error.message}`);
  }
}

// Execute schema files dynamically from database/schema directory
async function initDatabase() {
  const schemaDir = './database/schema';
  
  try {
    // Get all .sql files from schema directory
    const files = await fs.readdir(schemaDir);
    const sqlFiles = files
      .filter(file => path.extname(file) === '.sql')
      .sort();
    
    // Begin transaction
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    // Execute files in alphabetical order
    for (const sqlFile of sqlFiles) {
      const filePath = path.join(schemaDir, sqlFile);
      await executeSQLFile(filePath);
    }
    
    // Commit transaction if all files executed successfully
    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log('Database schema initialized successfully');
    // Do NOT close the database connection here, keep it open for seeding
    // db.close();
  } catch (error) {
    console.error('Error initializing database:', error.message);
    
    // Rollback transaction on failure
    try {
      await new Promise((resolve, reject) => {
        db.run('ROLLBACK', (err) => {
          if (err) {
            console.error('Error rolling back transaction:', err.message);
          }
          resolve();
        });
      });
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError.message);
    }
    
    db.close();
    process.exit(1);
  }
}

// Seed RBAC data after schema creation
async function seedDatabase() {
  try {
    await seedRBAC(db);
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    db.close();
    process.exit(1);
  }
}

// Run both initialization and seeding
async function initAndSeedDatabase() {
  await initDatabase();
  await seedDatabase();
  db.close(); // Close connection after seeding
}

// Only run if this file is executed directly
if (require.main === module) {
  initAndSeedDatabase();
}


