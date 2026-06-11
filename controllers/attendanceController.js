const db = require('../db');

// GET /api/attendance
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        a.*,
        i.first_name,
        i.last_name,
        -- PostgreSQL way of calculating minutes between two TIME values
        EXTRACT(EPOCH FROM (a.clock_out - a.clock_in)) / 60 AS minutes_worked
      FROM Attendance a
      JOIN Intern i ON a.intern_id = i.intern_id
      ORDER BY a.date DESC, a.clock_in DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/attendance/:id
exports.getById = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        a.*,
        i.first_name,
        i.last_name,
        EXTRACT(EPOCH FROM (a.clock_out - a.clock_in)) / 60 AS minutes_worked
      FROM Attendance a
      JOIN Intern i ON a.intern_id = i.intern_id
      WHERE a.attendance_id = $1
    `, [req.params.id]);

    if (!result.rows[0]) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/attendance/clock-in
exports.clockIn = async (req, res) => {
  try {
    const { intern_id } = req.body;

    if (!intern_id) {
      return res.status(400).json({ error: 'intern_id is required' });
    }

    // CHECK FOR DUPLICATE — look for an open session today
    // CURRENT_DATE and LOCALTIME are the PostgreSQL versions
    // of MySQL's CURDATE() and CURTIME()
    const existing = await db.query(
      `SELECT attendance_id FROM Attendance
       WHERE intern_id = $1 
       AND date = CURRENT_DATE 
       AND clock_out IS NULL`,
      [intern_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: 'Intern is already clocked in. Please clock out first.'
      });
    }

    // Insert with today's date and current time
    const result = await db.query(
      `INSERT INTO Attendance (intern_id, date, clock_in)
       VALUES ($1, CURRENT_DATE, LOCALTIME)
       RETURNING attendance_id`,
      [intern_id]
    );

    res.status(201).json({
      message:       'Clocked in successfully',
      attendance_id: result.rows[0].attendance_id,
      clocked_in_at: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/attendance/clock-out
exports.clockOut = async (req, res) => {
  try {
    const { intern_id } = req.body;

    if (!intern_id) {
      return res.status(400).json({ error: 'intern_id is required' });
    }

    // Find the open session for today
    const existing = await db.query(
      `SELECT attendance_id FROM Attendance
       WHERE intern_id = $1 
       AND date = CURRENT_DATE 
       AND clock_out IS NULL`,
      [intern_id]
    );

    if (existing.rows.length === 0) {
      return res.status(409).json({
        error: 'No active clock-in found for this intern today.'
      });
    }

    // Close the open session by setting clock_out
    await db.query(
      `UPDATE Attendance
       SET clock_out = LOCALTIME
       WHERE intern_id = $1 
       AND date = CURRENT_DATE 
       AND clock_out IS NULL`,
      [intern_id]
    );

    // Fetch the completed record to return the duration
    const completed = await db.query(
      `SELECT *,
         EXTRACT(EPOCH FROM (clock_out - clock_in)) / 60 AS minutes_worked
       FROM Attendance
       WHERE attendance_id = $1`,
      [existing.rows[0].attendance_id]
    );

    res.json({
      message:        'Clocked out successfully',
      minutes_worked: completed.rows[0].minutes_worked,
      record:         completed.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/attendance/intern/:intern_id
exports.getByIntern = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        a.*,
        EXTRACT(EPOCH FROM (a.clock_out - a.clock_in)) / 60 AS minutes_worked
      FROM Attendance a
      WHERE a.intern_id = $1
      ORDER BY a.date DESC, a.clock_in DESC
    `, [req.params.intern_id]);

    const rows = result.rows;

    // Add up total minutes across all sessions
    const totalMinutes = rows.reduce((sum, row) => sum + (row.minutes_worked || 0), 0);

    res.json({
      intern_id:      req.params.intern_id,
      total_sessions: rows.length,
      total_minutes:  Math.round(totalMinutes),
      records:        rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/attendance/report/range?start=2025-01-01&end=2025-01-31
exports.getByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Both ?start= and ?end= query params are required' });
    }

    const result = await db.query(`
      SELECT
        a.*,
        i.first_name,
        i.last_name,
        d.dpt_name,
        EXTRACT(EPOCH FROM (a.clock_out - a.clock_in)) / 60 AS minutes_worked
      FROM Attendance a
      JOIN Intern      i ON a.intern_id     = i.intern_id
      LEFT JOIN Department d ON i.department_id = d.department_id
      WHERE a.date BETWEEN $1 AND $2
      ORDER BY a.date ASC, a.clock_in ASC
    `, [start, end]);

    res.json({
      from:    start,
      to:      end,
      count:   result.rows.length,
      records: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/attendance/:id
exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM Attendance WHERE attendance_id = $1', [req.params.id]);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};