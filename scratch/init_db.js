import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres({
  host: 'db.dmyuhdzdrijewnstotpy.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: '735R@%PHha!jpPp',
});

async function initDb() {
  console.log('Initializing database tables...');
  
  try {
    // 1. Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        stock NUMERIC NOT NULL,
        category TEXT,
        type TEXT CHECK (type IN ('PARFUM', 'NON-PARFUM')),
        image TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ Table "products" created or already exists.');

    // 2. Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        total NUMERIC NOT NULL,
        cash NUMERIC NOT NULL,
        change NUMERIC NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ Table "transactions" created or already exists.');

    // 3. Create transaction_items table
    await sql`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
        product_id TEXT,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        quantity NUMERIC NOT NULL,
        ml NUMERIC,
        subtotal NUMERIC NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ Table "transaction_items" created or already exists.');

    // 4. Seed initial products if table is empty
    const productsCount = await sql`SELECT count(*) FROM products`;
    if (parseInt(productsCount[0].count) === 0) {
      console.log('Seeding initial products...');
      const INITIAL_PRODUCTS = [
        { id: '1', name: 'Oud Wood Special', price: 15000, type: 'PARFUM', stock: 1000, category: 'Woody' },
        { id: '2', name: 'Rose Petal Bliss', price: 12000, type: 'PARFUM', stock: 500, category: 'Floral' },
        { id: '3', name: 'Ocean Breeze', price: 10000, type: 'PARFUM', stock: 2000, category: 'Fresh' },
        { id: '4', name: 'Vanilla Sky', price: 18000, type: 'PARFUM', stock: 800, category: 'Sweet' },
        { id: '5', name: 'Empty Bottle 30ml', price: 5000, type: 'NON-PARFUM', stock: 50, category: 'Accessories' },
        { id: '6', name: 'Empty Bottle 50ml', price: 7500, type: 'NON-PARFUM', stock: 30, category: 'Accessories' },
        { id: '7', name: 'Gift Box Medium', price: 15000, type: 'NON-PARFUM', stock: 20, category: 'Packaging' },
        { id: '8', name: 'Atomizer Spray', price: 2500, type: 'NON-PARFUM', stock: 100, category: 'Accessories' },
      ];

      for (const p of INITIAL_PRODUCTS) {
        await sql`
          INSERT INTO products (id, name, price, type, stock, category)
          VALUES (${p.id}, ${p.name}, ${p.price}, ${p.type}, ${p.stock}, ${p.category})
        `;
      }
      console.log('✅ Seeded', INITIAL_PRODUCTS.length, 'products.');
    }

    console.log('🚀 Database initialization complete!');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  } finally {
    await sql.end();
  }
}

initDb();
