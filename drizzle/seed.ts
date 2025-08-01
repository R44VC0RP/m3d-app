import { db, colors, fileAddons, files } from '@/lib/db';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seed() {
  console.log('🌱 Starting seed...');

  // Seed Colors
  const colorData = [
    { name: 'White', hexCode: '#FFFFFF' },
    { name: 'Black', hexCode: '#000000' },
    { name: 'Red', hexCode: '#FF0000' },
    { name: 'Blue', hexCode: '#0000FF' },
    { name: 'Green', hexCode: '#00FF00' },
    { name: 'Yellow', hexCode: '#FFFF00' },
    { name: 'Orange', hexCode: '#FFA500' },
    { name: 'Purple', hexCode: '#800080' },
    { name: 'Gray', hexCode: '#808080' },
    { name: 'Pink', hexCode: '#FFC0CB' },
    { name: 'Brown', hexCode: '#A52A2A' },
    { name: 'Gold', hexCode: '#FFD700' },
    { name: 'Silver', hexCode: '#C0C0C0' },
    { name: 'Transparent', hexCode: '#FFFFFF00' }
  ];

  for (const color of colorData) {
    const existing = await db.query.colors.findFirst({
      where: eq(colors.hexCode, color.hexCode)
    });

    if (!existing) {
      await db.insert(colors).values(color);
      console.log(`✅ Created color: ${color.name}`);
    }
  }

  // Seed File Addons
  const addonData = [
    {
      name: 'Queue Priority',
      description: 'Jump to the top of the print queue',
      price: 5.00,
      type: 'queue_priority'
    },
    {
      name: 'Print Assistance',
      description: 'Get help with print settings and optimization',
      price: 0,
      type: 'print_assistance'
    },
    {
      name: 'Multi-color Print',
      description: 'Print with multiple colors in a single job',
      price: 0,
      type: 'multi_color'
    }
  ];

  for (const addon of addonData) {
    const existing = await db.query.fileAddons.findFirst({
      where: eq(fileAddons.type, addon.type)
    });

    if (!existing) {
      await db.insert(fileAddons).values(addon);
      console.log(`✅ Created addon: ${addon.name}`);
    }
  }

  // Seed Example Files
  const fileData = [
    {
      name: 'Phone Stand',
      filetype: 'STL',
      filename: 'phone_stand_v2.stl',
      dimensionX: 80,
      dimensionY: 60,
      dimensionZ: 100,
      mass: 45,
      slicingStatus: 'ready',
      price: 15.00,
      images: [
        'https://images.unsplash.com/photo-1609205807490-b15b9677c6b8?w=800',
        'https://images.unsplash.com/photo-1586253634026-8cb574908d1e?w=800'
      ],
      metadata: {
        printTime: '2h 30m',
        supports: false,
        infill: 20
      }
    },
    {
      name: 'Desk Organizer',
      filetype: 'STL',
      filename: 'desk_organizer_modular.stl',
      dimensionX: 150,
      dimensionY: 100,
      dimensionZ: 80,
      mass: 120,
      slicingStatus: 'ready',
      price: 25.00,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
      ],
      metadata: {
        printTime: '4h 15m',
        supports: false,
        infill: 25
      }
    },
    {
      name: 'Custom Gear Set',
      filetype: 'STL',
      filename: 'gear_set_precision.stl',
      dimensionX: 50,
      dimensionY: 50,
      dimensionZ: 20,
      mass: 30,
      slicingStatus: 'processing',
      price: 12.00,
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
      ],
      metadata: {
        printTime: '1h 45m',
        supports: true,
        infill: 50
      }
    },
    {
      name: 'Plant Pot',
      filetype: 'STL',
      filename: 'geometric_planter.stl',
      dimensionX: 100,
      dimensionY: 100,
      dimensionZ: 120,
      mass: 85,
      slicingStatus: 'ready',
      price: 18.00,
      images: [
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'
      ],
      metadata: {
        printTime: '3h 30m',
        supports: false,
        infill: 15
      }
    },
    {
      name: 'Cable Management Clips',
      filetype: 'STL',
      filename: 'cable_clips_set.stl',
      dimensionX: 30,
      dimensionY: 20,
      dimensionZ: 15,
      mass: 10,
      slicingStatus: 'ready',
      price: 8.00,
      images: [
        'https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=800'
      ],
      metadata: {
        printTime: '45m',
        supports: false,
        infill: 30
      }
    }
  ];

  for (const file of fileData) {
    await db.insert(files).values(file);
    console.log(`✅ Created file: ${file.name}`);
  }

  console.log('✅ Seed completed!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });