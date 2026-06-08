// ============================================================
// db.js — Database Connection File
// ============================================================
// This file creates ONE shared connection pool to MySQL.
// A "pool" is a set of reusable connections — instead of
// opening and closing a new connection on every request
// (slow and wasteful), we maintain a pool and borrow from it.
//
// Think of it like a taxi rank: cars wait ready to go,
// you grab one, use it, return it — rather than calling
// a new car every single time.
// ============================================================

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
  host:     process.env.DB_HOST,      // e.g. "localhost" or an IP address
  user:     process.env.DB_USER,      // e.g. "root"
  password: process.env.DB_PASSWORD,  // your MySQL password
  database: process.env.DB_NAME,      // e.g. "caainterns"

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
