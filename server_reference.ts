
/**
 * BACKEND IMPLEMENTATION REFERENCE (Node.js + MSSQL)
 * 
 * Instructions:
 * 1. Install dependencies: npm install express mssql cors dotenv
 * 2. Create a .env file with your credentials
 * 3. Run with: node server.js
 */

/* 
// --- SQL SERVER SETUP SCRIPT ---
CREATE DATABASE BeanCropsDB;
GO
USE BeanCropsDB;
GO
CREATE TABLE BeanSales (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Product NVARCHAR(50) NOT NULL,
    SaleDate DATE NOT NULL,
    Area NVARCHAR(100) NOT NULL,
    Weight NVARCHAR(20) NOT NULL,
    Quantity INT NOT NULL,
    TotalPackages INT NOT NULL,
    TotalPrice DECIMAL(18, 2) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
*/

/*
// --- server.js ---
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// SQL Server Connection Configuration
const dbConfig = {
    user: 'sa',             // Your SQL Username
    password: 'YourPassword', // Your SQL Password
    server: 'localhost',    // Your Server Instance (e.g. 'localhost' or '192.168.1.5')
    database: 'BeanCropsDB',
    options: {
        encrypt: false, 
        trustServerCertificate: true // Crucial for local development
    }
};

// Connect to SQL Server
sql.connect(dbConfig).then(pool => {
    console.log('Connected to SQL Server successfully');
    
    // GET Orders
    app.get('/api/orders', async (req, res) => {
        try {
            const result = await pool.request().query('SELECT * FROM BeanSales ORDER BY CreatedAt DESC');
            res.json(result.recordset);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // POST New Order
    app.post('/api/orders', async (req, res) => {
        const { product, date, area, weight, quantity, totalPackages, totalPrice } = req.body;
        try {
            await pool.request()
                .input('product', sql.NVarChar, product)
                .input('date', sql.Date, date)
                .input('area', sql.NVarChar, area)
                .input('weight', sql.NVarChar, weight)
                .input('quantity', sql.Int, quantity)
                .input('totalPackages', sql.Int, totalPackages)
                .input('totalPrice', sql.Decimal(18, 2), totalPrice)
                .query(`INSERT INTO BeanSales (Product, SaleDate, Area, Weight, Quantity, TotalPackages, TotalPrice) 
                        VALUES (@product, @date, @area, @weight, @quantity, @totalPackages, @totalPrice)`);
            res.status(201).json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // DELETE All (Reset)
    app.delete('/api/orders', async (req, res) => {
        try {
            await pool.request().query('DELETE FROM BeanSales');
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

}).catch(err => {
    console.error('Database connection failed:', err);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend API running on http://localhost:${PORT}`));
*/
