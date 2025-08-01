# Database Setup - Neon PostgreSQL with Drizzle ORM

This project uses **Neon PostgreSQL** as the database with **Drizzle ORM** for type-safe database operations.

## Setup Instructions

### 1. Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy your connection string from the dashboard

### 2. Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the `DATABASE_URL` in `.env.local` with your Neon connection string:
   ```
   DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/dbname?sslmode=require"
   ```

### 3. Database Schema

The database includes the following tables:

- **files**: Store 3D file information (name, dimensions, mass, etc.)
- **colors**: Available print colors
- **file_addons**: Available add-ons (Queue Priority, Print Assistance, etc.)
- **cart_items**: Items added to the shopping cart
- **cart_addons**: Junction table for cart items and their selected add-ons

### 4. Initialize Database

Push the schema to your Neon database:

```bash
npm run db:push
```

### 5. Seed Database

Populate with default colors and addons:

```bash
npm run db:seed
```

Or run both setup and seed in one command:

```bash
npm run db:setup
```

## Available Scripts

- `npm run db:generate` - Generate migration files
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed` - Seed database with default data
- `npm run db:setup` - Complete database setup with seeding

## Schema Overview

### Files Table
```typescript
{
  id: uuid (primary key)
  name: string
  filetype: string  
  filename: string
  dimensionsX/Y/Z: number
  mass: number
  slicingStatus: 'pending' | 'processing' | 'completed' | 'failed'
  metadata: JSON string
  createdAt/updatedAt: timestamp
}
```

### Cart System
- Cart items reference files and colors
- Many-to-many relationship between cart items and addons
- Proper foreign key constraints with cascading deletes

## Production Deployment

1. Set `DATABASE_URL` environment variable in your deployment platform
2. Run `npm run db:push` to create tables
3. Run `npm run db:seed` to populate default data
4. Deploy your application

The database will automatically handle connections and scaling with Neon's serverless PostgreSQL.