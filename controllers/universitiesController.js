const db = require('../db');

// GET /api/universities
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.*,
        COUNT(i.intern_id) AS intern_count
      FROM University u
      LEFT JOIN Intern i ON i.university_id = u.university_id
      GROUP BY u.university_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/universities/:id
exports.getById = async (req, res) => {
  try {
    const uniResult = await db.query(
      'SELECT * FROM University WHERE university_id = $1',
      [req.params.id]
    );
    if (!uniResult.rows[0]) return res.status(404).json({ error: 'University not found' });

    const internsResult = await db.query(
      'SELECT intern_id, first_name, last_name, email FROM Intern WHERE university_id = $1',
      [req.params.id]
    );

    res.json({ ...uniResult.rows[0], interns: internsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/universities
exports.create = async (req, res) => {
  try {
    const { uni_name, location } = req.body;
    if (!uni_name) return res.status(400).json({ error: 'uni_name is required' });

    const result = await db.query(
      'INSERT INTO University (uni_name, location) VALUES ($1, $2) RETURNING university_id',
      [uni_name, location]
    );
    res.status(201).json({ message: 'University created', university_id: result.rows[0].university_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/universities/:id
exports.update = async (req, res) => {
  try {
    const { uni_name, location } = req.body;
    await db.query(
      'UPDATE University SET uni_name = $1, location = $2 WHERE university_id = $3',
      [uni_name, location, req.params.id]
    );
    res.json({ message: 'University updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/universities/:id
exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM University WHERE university_id = $1', [req.params.id]);
    res.json({ message: 'University deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};