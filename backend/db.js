const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'moviesdb',
  password: '385154777',
  port: 5432,
});

module.exports = pool;
