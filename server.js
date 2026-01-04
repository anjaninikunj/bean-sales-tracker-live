
import express from 'express';
import sql from 'mssql';
import cors from 'cors';

const dbConfig = {
    user: process.env.DB_USER || 'beanadmin', 
    password: process.env.DB_PASSWORD || 'AmbeFarm@7479#$', 
    server: process.env.DB_SERVER || 'beantracker-server-ambe-1018.database.windows.net',            
    database: process.env.DB_NAME || 'beantracker-server-ambe',
    port: 1433,
    options: {
        encrypt: true, 
        trustServerCertificate: false,
        enableArithAbort: true,
        connectTimeout: 30000 
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const app = express();
app.set('trust proxy', 1); 
app.use(express.json());

// Allow your Vercel URL and localhost
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS']
}));

let pool;

async function connectToDatabase() {
    try {
        console.log('📡 Azure SQL: Connecting to Live Database...');
        pool = await sql.connect(dbConfig);
        console.log('✅ Azure SQL: Connected and Ready');
        
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BeanSales' AND xtype='U')
            BEGIN
                CREATE TABLE BeanSales (
                    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    Product NVARCHAR(50) NOT NULL,
                    SaleDate DATE NOT NULL,
                    CustomerName NVARCHAR(200),
                    CustomerPhone NVARCHAR(20),
                    Area NVARCHAR(100) NOT NULL,
                    Weight NVARCHAR(20) NOT NULL,
                    Quantity INT NOT NULL,
                    TotalPackages INT NOT NULL,
                    TotalPrice DECIMAL(18, 2) NOT NULL,
                    PaymentStatus NVARCHAR(20) DEFAULT 'Paid',
                    Notes NVARCHAR(MAX),
                    CreatedAt DATETIME2 DEFAULT GETDATE()
                )
            END
        `);
    } catch (err) {
        console.error('❌ DB CONNECTION FAILED:', err.message);
        setTimeout(connectToDatabase, 5000);
    }
}

app.get('/api/orders', async (req, res) => {
    try {
        if (!pool) return res.status(503).json({ error: 'Database is still connecting...' });
        const result = await pool.request().query('SELECT * FROM BeanSales ORDER BY SaleDate DESC, CreatedAt DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { product, date, area, weight, quantity, totalPrice, customerName, customerPhone, paymentStatus, notes } = req.body;
    try {
        if (!pool) return res.status(503).json({ error: 'Database is still connecting...' });
        await pool.request()
            .input('product', sql.NVarChar, product)
            .input('date', sql.Date, date)
            .input('customerName', sql.NVarChar, customerName)
            .input('customerPhone', sql.NVarChar, customerPhone)
            .input('area', sql.NVarChar, area)
            .input('weight', sql.NVarChar, weight)
            .input('quantity', sql.Int, quantity)
            .input('totalPackages', sql.Int, quantity)
            .input('totalPrice', sql.Decimal(18, 2), totalPrice)
            .input('paymentStatus', sql.NVarChar, paymentStatus)
            .input('notes', sql.NVarChar, notes)
            .query(`
                INSERT INTO BeanSales (Product, SaleDate, CustomerName, CustomerPhone, Area, Weight, Quantity, TotalPackages, TotalPrice, PaymentStatus, Notes)
                VALUES (@product, @date, @customerName, @customerPhone, @area, @weight, @quantity, @totalPackages, @totalPrice, @paymentStatus, @notes)
            `);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: pool ? 'connected' : 'connecting' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    console.log(`🚀 Production API Server running on port ${PORT}`);
    await connectToDatabase();
});
