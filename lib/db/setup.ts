#!/usr/bin/env tsx

import { db } from './index';
import { seedDatabase } from './seed';

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // The tables will be created automatically when we first query them
    // due to Neon's serverless nature and our schema definitions
    
    // Seed the database with default data
    await seedDatabase();
    
    console.log('✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };