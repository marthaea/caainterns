// db.js. Database Connection File
// This file is a bridge to the database. Without it, our controllers would have no way to talk to PostgreSQL.
// It creates a connection pool and exports it for use in all controllers.
//
// Why a pool? Because opening/closing connections is slow. A pool maintains
// a set of open connections that can be reused, making the API faster and more efficient.
// This file creates ONE shared connection pool to PostgreSQL. 
// A "pool" is a set of reusable connections, instead of
// opening and closing a new connection on every request
// (slow and wasteful), we maintain a pool and borrow from it.
//
// Think of it like a restaurant: the pool is the dining room with tables (connections).
// When a customer (API request) arrives, they get seated at an available table.
// When they're done, the table is cleaned and ready for the next customer.
// This way we can serve many customers efficiently without waiting for new tables to be set up.
//

const { Pool } = require('pg')


// dotenv should already be loaded in index.js but calling
// it again here makes this file self-contained
require('dotenv').config();

// createPool sets up the pool of connections.
// All values come from your .env file — never hardcode passwords!
const pool = new Pool({
  host:     process.env.DB_HOST,      
  user:     process.env.DB_USER,      // postgres
  password: process.env.DB_PASSWORD,  
  database: process.env.DB_NAME,      // caainterns
  port:     process.env.DB_PORT,
  ssl:      { rejectUnauthorized: false }  // Supabase requires SSL
});


// Export the pool so every controller can import and use it:
// const db = require('../db');
module.exports = pool;
