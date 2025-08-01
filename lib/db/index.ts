import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Lazy database connection
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Create the connection
    const sql = neon(process.env.DATABASE_URL);

    // Create the database instance
    _db = drizzle(sql, { 
      schema,
      logger: process.env.NODE_ENV === 'development'
    });
  }
  
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  }
});

// Export types and schema
export * from './schema';