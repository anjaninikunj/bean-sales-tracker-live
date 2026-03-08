
import sql from 'mssql';
import fs from 'fs';

const dbConfig = {
    user: 'beanadmin',
    password: 'AmbeFarm@7479#$',
    server: 'beantracker-server-ambe-1018.database.windows.net',
    database: 'beantracker-server-ambe',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
        connectTimeout: 30000
    }
};

async function backupData() {
    try {
        console.log('📡 Accessing Azure SQL to get main copy...');
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM BeanSales');
        
        const data = result.recordset;
        fs.writeFileSync('bean_sales_backup_march_2026.json', JSON.stringify(data, null, 2));
        
        console.log(`✅ SUCCESS! Found ${data.length} records.`);
        console.log('📂 Main copy saved locally as: bean_sales_backup_march_2026.json');
        
        await pool.close();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

backupData();
