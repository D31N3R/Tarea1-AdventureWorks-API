// Este archivo se encarga de conectar la API con SQL Server
const sql = require('mssql');
require('dotenv').config();

// Datos de conexión que vienen del archivo .env
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: false, // en local no necesitamos conexión encriptada
    trustServerCertificate: true
  }
};

// Guardamos la conexión aquí para no abrir una nueva en cada petición
let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('Conectado a SQL Server:', process.env.DB_DATABASE);
  }
  return pool;
}

module.exports = { sql, getPool };