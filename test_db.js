
import sql from 'mssql';

const dbConfig = {
    user: 'beanadmin',
    password: 'AmbeFarm@7479#$',
    server: 'beantracker-server-ambe-1018.database.windows.net',
    database: 'beantracker-server-ambe',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        connectTimeout: 15000
    }
};

async function test() {
    console.log('Testing connection...');
    try {
        await sql.connect(dbConfig);
        console.log('SUCCESS: Connected to Azure SQL');
        const result = await sql.query`SELECT count(*) as count FROM BeanSales`;
        console.log('DATA CHECK: Current records in DB:', result.recordset[0].count);
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
}

test();
