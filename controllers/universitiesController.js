// ============================================================
// controllers/universitiesController.js — Logic for Universities
// ============================================================
// Simple table. We enrich it with intern count per university
// so you can see which universities send the most interns.
// ============================================================

const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        u.*,
        COUNT(i.id) AS intern_count
      FROM university u
      LEFT JOIN intern i ON i.university_id = u.id
      GROUP BY u.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [uni] = await db.query('SELECT * FROM university WHERE id = ?', [req.params.id]);
    if (!uni[0]) return res.status(404).json({ error: 'University not found' });

    // Interns from this university
    const [interns] = await db.query(
      'SELECT id, first_name, last_name, email FROM intern WHERE university_id = ?',
      [req.params.id]
    );

    res.json({ ...uni[0], interns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'University name is required' });

    const [result] = await db.query('INSERT INTO university (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'University created', university_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('UPDATE university SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ message: 'University updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM university WHERE id = ?', [req.params.id]);
    res.json({ message: 'University deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
