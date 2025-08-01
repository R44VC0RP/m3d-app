import { db, colors, fileAddons } from './index';

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Insert default colors
    const defaultColors = [
      { id: 'white', name: 'White', hexCode: '#FFFFFF' },
      { id: 'black', name: 'Black', hexCode: '#000000' },
      { id: 'red', name: 'Red', hexCode: '#FF0000' },
      { id: 'blue', name: 'Blue', hexCode: '#0000FF' },
      { id: 'green', name: 'Green', hexCode: '#00FF00' },
      { id: 'yellow', name: 'Yellow', hexCode: '#FFFF00' },
      { id: 'orange', name: 'Orange', hexCode: '#FFA500' },
      { id: 'purple', name: 'Purple', hexCode: '#800080' }
    ];

    console.log('📦 Inserting colors...');
    for (const color of defaultColors) {
      await db.insert(colors).values(color).onConflictDoNothing();
    }

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

    console.log('🔧 Inserting addons...');
    for (const addon of defaultAddons) {
      await db.insert(fileAddons).values(addon).onConflictDoNothing();
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}