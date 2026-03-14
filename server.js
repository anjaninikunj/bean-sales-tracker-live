import express from 'express';
import pg from 'pg';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

// Construct Supabase Postgres Connection String
const DB_PASSWORD = process.env.DB_PASSWORD || 'AmbeFarm@7479#$';
const encodedPassword = encodeURIComponent(DB_PASSWORD);
const connectionString = `postgresql://postgres:${encodedPassword}@db.nphpuqrocobyoofkapdy.supabase.co:5432/postgres`;

// Initialize Postgres Pool
const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000
});

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));

// CORS configuration for production
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

let isDbInitialized = false;

async function initDb() {
    if (isDbInitialized) return;
    try {
        console.log('📡 Supabase Postgres: Attempting Connection...');
        
        // Postgres syntax for creating table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "BeanSales" (
                "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "Product" VARCHAR(50) NOT NULL,
                "SaleDate" DATE NOT NULL,
                "CustomerName" VARCHAR(200),
                "CustomerPhone" VARCHAR(20),
                "Area" VARCHAR(100) NOT NULL,
                "Weight" VARCHAR(20) NOT NULL,
                "Quantity" INT NOT NULL,
                "TotalPackages" INT NOT NULL,
                "TotalPrice" NUMERIC(18, 2) NOT NULL,
                "PaymentStatus" VARCHAR(20) DEFAULT 'Paid',
                "Notes" TEXT,
                "CreatedAt" TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Supabase Postgres: Connected and Table Initialized');
        isDbInitialized = true;
    } catch (err) {
        console.error('❌ DB CONNECTION FAILED:', err.message);
        throw err;
    }
}

app.get('/api/orders', async (req, res) => {
    console.log(`📱 [MOBILE] GET Request from: ${req.ip}`);
    try {
        await initDb();
        const result = await pool.query('SELECT * FROM "BeanSales" ORDER BY "SaleDate" DESC, "CreatedAt" DESC');
        console.log(`✅ [MOBILE] Found ${result.rows.length} records. Sending to phone...`);
        
        // Map postgres 'Id' back to camelCase 'id' for JSON response
        const orders = result.rows.map(row => ({
            id: row.Id,
            product: row.Product,
            date: new Date(row.SaleDate).toISOString().split('T')[0],
            customerName: row.CustomerName,
            customerPhone: row.CustomerPhone,
            area: row.Area,
            weight: row.Weight,
            quantity: row.Quantity,
            totalPackages: row.TotalPackages,
            totalPrice: Number(row.TotalPrice),
            paymentStatus: row.PaymentStatus,
            notes: row.Notes,
            createdAt: row.CreatedAt
        }));
        
        res.json(orders);
    } catch (err) {
        console.error('❌ [MOBILE] Fetch Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { product, date, area, weight, quantity, totalPrice, customerName, customerPhone, paymentStatus, notes } = req.body;
    try {
        await initDb();
        await pool.query(`
            INSERT INTO "BeanSales" ("Product", "SaleDate", "CustomerName", "CustomerPhone", "Area", "Weight", "Quantity", "TotalPackages", "TotalPrice", "PaymentStatus", "Notes")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [product, date, customerName, customerPhone, area, weight, quantity, quantity, totalPrice, paymentStatus, notes]);
        
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an existing order
app.put('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { product, date, area, weight, quantity, totalPrice, customerName, customerPhone, paymentStatus, notes } = req.body;
    try {
        await initDb();
        await pool.query(`
            UPDATE "BeanSales"
            SET "Product" = $1,
                "SaleDate" = $2,
                "CustomerName" = $3,
                "CustomerPhone" = $4,
                "Area" = $5,
                "Weight" = $6,
                "Quantity" = $7,
                "TotalPackages" = $8,
                "TotalPrice" = $9,
                "PaymentStatus" = $10,
                "Notes" = $11
            WHERE "Id" = $12
        `, [product, date, customerName, customerPhone, area, weight, quantity, quantity, totalPrice, paymentStatus, notes, id]);
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a single order
app.delete('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await initDb();
        await pool.query('DELETE FROM "BeanSales" WHERE "Id" = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear all orders (Reset Database)
app.delete('/api/orders', async (req, res) => {
    try {
        await initDb();
        await pool.query('DELETE FROM "BeanSales"');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/health', async (req, res) => {
    try {
        await initDb();
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'connected' });
    } catch (err) {
        res.status(503).json({ status: 'error', error: err.message });
    }
});

// Handle React Routing, return all requests to React app
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Export app for Vercel Serverless
export default app;

// For Local/Render Server Startup (Start only if run directly via node script)
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, async () => {
        console.log(`🚀 API Server running on port ${PORT}`);
        try {
            await initDb();
        } catch (e) {
            console.error(e);
        }
    });
}
