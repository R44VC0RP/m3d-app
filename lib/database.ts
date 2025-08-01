import sqlite3 from 'sqlite3';
import path from 'path';

// Database types
export interface File {
  id: string;
  name: string;
  filetype: string;
  filename: string;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  mass: number; // in grams
  slicing_status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  file_id: string;
  quality: 'good' | 'better' | 'best'; // 0.24mm, 0.20mm, 0.16mm
  quantity: number; // 1-100
  color: string;
  created_at: string;
  updated_at: string;
}

export interface FileAddon {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartAddon {
  id: string;
  cart_item_id: string;
  addon_id: string;
  created_at: string;
}

export interface Color {
  id: string;
  name: string;
  hex_code: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Database connection
const dbPath = path.join(process.cwd(), 'mandarin3d.db');
let db: sqlite3.Database | null = null;

export function getDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Initialize tables
      initializeTables(db!)
        .then(() => resolve(db!))
        .catch(reject);
    });
  });
}

async function initializeTables(database: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    const queries = [
      // Files table
      `CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        filetype TEXT NOT NULL,
        filename TEXT NOT NULL,
        dimensions_x REAL NOT NULL,
        dimensions_y REAL NOT NULL,
        dimensions_z REAL NOT NULL,
        mass REAL NOT NULL,
        slicing_status TEXT NOT NULL DEFAULT 'pending',
        metadata TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Cart items table
      `CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL,
        quality TEXT NOT NULL DEFAULT 'better',
        quantity INTEGER NOT NULL DEFAULT 1,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (file_id) REFERENCES files (id)
      )`,
      
      // File addons table
      `CREATE TABLE IF NOT EXISTS file_addons (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Cart addons junction table
      `CREATE TABLE IF NOT EXISTS cart_addons (
        id TEXT PRIMARY KEY,
        cart_item_id TEXT NOT NULL,
        addon_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_item_id) REFERENCES cart_items (id),
        FOREIGN KEY (addon_id) REFERENCES file_addons (id)
      )`,
      
      // Colors table
      `CREATE TABLE IF NOT EXISTS colors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        hex_code TEXT NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    let completed = 0;
    const total = queries.length;

    queries.forEach((query) => {
      database.run(query, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        completed++;
        if (completed === total) {
          // Insert default addons and colors
          insertDefaultData(database)
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  });
}

async function insertDefaultData(database: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    // Insert default addons
    const defaultAddons = [
      {
        id: 'queue-priority',
        name: 'Queue Priority',
        description: 'Jump to the top of the orders queue',
        price: 500 // $5.00 in cents
      },
      {
        id: 'print-assistance',
        name: 'Print Assistance',
        description: 'No extra cost assistance with printing',
        price: 0
      },
      {
        id: 'multi-color-print',
        name: 'Multi-color Print',
        description: 'No extra cost multi-color printing',
        price: 0
      }
    ];

    // Insert default colors
    const defaultColors = [
      { id: 'white', name: 'White', hex_code: '#FFFFFF' },
      { id: 'black', name: 'Black', hex_code: '#000000' },
      { id: 'red', name: 'Red', hex_code: '#FF0000' },
      { id: 'blue', name: 'Blue', hex_code: '#0000FF' },
      { id: 'green', name: 'Green', hex_code: '#00FF00' },
      { id: 'yellow', name: 'Yellow', hex_code: '#FFFF00' },
      { id: 'orange', name: 'Orange', hex_code: '#FFA500' },
      { id: 'purple', name: 'Purple', hex_code: '#800080' }
    ];

    let completed = 0;
    const totalInserts = defaultAddons.length + defaultColors.length;

    // Insert addons
    defaultAddons.forEach((addon) => {
      database.run(
        `INSERT OR IGNORE INTO file_addons (id, name, description, price, is_active) VALUES (?, ?, ?, ?, ?)`,
        [addon.id, addon.name, addon.description, addon.price, 1],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          completed++;
          if (completed === totalInserts) resolve();
        }
      );
    });

    // Insert colors
    defaultColors.forEach((color) => {
      database.run(
        `INSERT OR IGNORE INTO colors (id, name, hex_code, is_available) VALUES (?, ?, ?, ?)`,
        [color.id, color.name, color.hex_code, 1],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          completed++;
          if (completed === totalInserts) resolve();
        }
      );
    });
  });
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}