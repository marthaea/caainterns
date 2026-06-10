// db.js. Database Connection File
// This file is a bridge to the database. Without it, our controllers would have no way to talk to MySQL.
// It creates a connection pool and exports it for use in all controllers.
//
// Why a pool? Because opening/closing connections is slow. A pool maintains
// a set of open connections that can be reused, making the API faster and more efficient.
// This file creates ONE shared connection pool to MySQL. 
// A "pool" is a set of reusable connections, instead of
// opening and closing a new connection on every request
// (slow and wasteful), we maintain a pool and borrow from it.
//
// Think of it like a restaurant: the pool is the dining room with tables (connections).
// When a customer (API request) arrives, they get seated at an available table.
// When they're done, the table is cleaned and ready for the next customer.
// This way we can serve many customers efficiently without waiting for new tables to be set up.
//
// The mysql2 library provides this pooling functionality out of the box.

// mysql2 is a modern MySQL driver for Node.js
// We use the /promise version so we can use async/await
// instead of old-style callbacks
const mysql = require('mysql2/promise');

// dotenv should already be loaded in index.js but calling
// it again here makes this file self-contained
require('dotenv').config();

// createPool sets up the pool of connections.
// All values come from your .env file — never hardcode passwords!
const pool = mysql.createPool({
  host:     process.env.DB_HOST,      
  user:     process.env.DB_USER,      // postgres
  password: process.env.DB_PASSWORD,  
  database: process.env.DB_NAME,      // caainterns

  // waitForConnections: if all pool connections are busy,
  // new requests wait in a queue instead of failing immediately
  waitForConnections: true,

  // connectionLimit: max number of simultaneous connections.
  // 10 is a safe default for a small/medium app.
  connectionLimit: 10,

  // queueLimit: max requests waiting in the queue.
  // 0 = unlimited — requests never get auto-rejected
  queueLimit: 0,
});

// Export the pool so every controller can import and use it:
// const db = require('../db');
module.exports = pool;
