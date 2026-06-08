// ============================================================
// controllers/supervisorsController.js — Logic for Supervisors
// ============================================================
// Supervisors oversee interns. We enrich GET calls to also
// return the list of interns each supervisor manages.
// ============================================================

const db = require('../db');

// ============================================================
// GET /api/supervisors
// All supervisors with intern count
// ============================================================
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.*,
        COUNT(i.id) AS intern_count
      FROM supervisors s
      LEFT JOIN intern i ON i.supervisor_id = s.id
      GROUP BY s.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// GET /api/supervisors/:id
// One supervisor + their interns
// ============================================================
exports.getById = async (req, res) => {
  try {
    const [supervisor] = await db.query(
      'SELECT * FROM supervisors WHERE id = ?',
      [req.params.id]
    );
    if (!supervisor[0]) return res.status(404).json({ error: 'Supervisor not found' });

    const [interns] = await db.query(
      'SELECT id, first_name, last_name, email FROM intern WHERE supervisor_id = ?',
      [req.params.id]
    );

    res.json({ ...supervisor[0], interns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// POST /api/supervisors
// ============================================================
exports.create = async (req, res) => {
  try {
    const { first_name, last_name, email, phone } = req.body;
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'first_name, last_name, and email are required' });
    }

    const [result] = await db.query(
      'INSERT INTO supervisors (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)',
      [first_name, last_name, email, phone]
    );
    res.status(201).json({ message: 'Supervisor created', supervisor_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// PUT /api/supervisors/:id
// ============================================================
exports.update = async (req, res) => {
  try {
    const { first_name, last_name, email, phone } = req.body;
    await db.query(
      'UPDATE supervisors SET first_name=?, last_name=?, email=?, phone=? WHERE id=?',
      [first_name, last_name, email, phone, req.params.id]
    );
    res.json({ message: 'Supervisor updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// DELETE /api/supervisors/:id
// ============================================================
exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM supervisors WHERE id = ?', [req.params.id]);
    res.json({ message: 'Supervisor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
