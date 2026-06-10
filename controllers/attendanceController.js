//  The core componentof the biostar-like system.
// It handles:
//   - Clock In  (stamping arrival time)
//   - Clock Out (stamping departure time)
//   - Duplicate prevention (can't clock in twice)
//   - Reports (by intern, by date range)
//   - Duration calculation (minutes worked per session)

const db = require('../db');

// The url It runs on:
// GET /api/attendance
// All attendance records, joined with intern name so that results
// are human-readable, not just a list of IDs

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        a.*,
        i.first_name,
        i.last_name,

        -- TIMESTAMPDIFF calculates the difference between two
        -- datetime values in a given unit (MINUTE here).
        -- If clock_out is NULL (still clocked in), this returns NULL.
        TIMESTAMPDIFF(MINUTE, a.clock_in, a.clock_out) AS minutes_worked

      FROM attendance a
      JOIN intern i ON a.intern_id = i.id
      ORDER BY a.clock_in DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET /api/attendance/:id
// One specific attendance record by its own attendance id
exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        a.*,
        i.first_name,
        i.last_name,
        TIMESTAMPDIFF(MINUTE, a.clock_in, a.clock_out) AS minutes_worked
      FROM attendance a
      JOIN intern i ON a.intern_id = i.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (!rows[0]) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/attendance/clock-in
// Body: { "intern_id": 5 }
//
// HOW IT WORKS:
// 1. Check if this intern already has an OPEN session
//    (clock_in exists but clock_out is NULL = still inside)
// 2. If yes → reject. Can't clock in twice without clocking out.
// 3. If no  → insert a new row with clock_in = NOW()
//             leave clock_out as NULL (it'll be filled on clock-out)
exports.clockIn = async (req, res) => {
  try {
    const { intern_id } = req.body;

    if (!intern_id) {
      return res.status(400).json({ error: 'intern_id is required' });
    }

    // CHECK FOR DUPLICATE: look for a row where this intern
    // has clocked in but NOT yet clocked out
    const [existing] = await db.query(
      `SELECT attendance_id FROM Attendance
       WHERE intern_id = ? AND date = CURDATE() AND clock_out IS NULL`,
      [intern_id]
    );

    // existing is an array — if it has any item, the intern
    // is already clocked in
    if (existing.length > 0) {
      return res.status(409).json({
        // 409 = Conflict — the request conflicts with current state
        error: 'Intern is already clocked in. Please clock out first.'
      });
    }

    // All clear — record the clock-in with the current timestamp
    // NOW() is a MySQL function that returns the current datetime
    const [result] = await db.query(
      'INSERT INTO Attendance (intern_id, date, clock_in) VALUES (?, CURDATE(), CURTIME())',
      [intern_id]
    );

    res.status(201).json({
      message:       'Clocked in successfully',
      attendance_id: result.insertId,
      clocked_in_at: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// PUT /api/attendance/clock-out
// Body: { "intern_id": 5 }
//
// HOW IT WORKS:
// 1. Find the OPEN session for this intern (clock_out IS NULL)
// 2. If none found → they're not clocked in, return error
// 3. If found → set clock_out = NOW() on that row

exports.clockOut = async (req, res) => {
  try {
    const { intern_id } = req.body;

    if (!intern_id) {
      return res.status(400).json({ error: 'intern_id is required' });
    }

    // Find the open session
    const [existing] = await db.query(
      `SELECT attendance_id FROM Attendance
       WHERE intern_id = ? AND date = CURDATE() AND clock_out IS NULL`,
      [intern_id]
    );

    if (existing.length === 0) {
      return res.status(409).json({
        error: 'No active clock-in found for this intern, today.'
      });
    }

    // Update ONLY the open row — close it by setting clock_out
    await db.query(
      `UPDATE Attendance
       SET clock_out = CURTIME()
       WHERE intern_id = ? AND date = CURDATE() AND clock_out IS NULL`,
      [intern_id]
    );

    // Fetch the completed record so we can return the duration
    const [completed] = await db.query(
      `SELECT
         *,
         TIMESTAMPDIFF(MINUTE, clock_in, clock_out) AS minutes_worked
       FROM Attendance
       WHERE id = ?`,
      [existing[0].id]
    );

    res.json({
      message:       'Clocked out successfully',
      minutes_worked: completed[0].minutes_worked,
      record:        completed[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET /api/attendance/intern/:intern_id
// All attendance records for ONE specific intern

exports.getByIntern = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        a.*,
        TIMESTAMPDIFF(MINUTE, a.clock_in, a.clock_out) AS minutes_worked
      FROM attendance a
      WHERE a.intern_id = ?
      ORDER BY a.clock_in DESC
    `, [req.params.intern_id]);

    // Also calculate total minutes across all sessions
    const totalMinutes = rows.reduce((sum, row) => sum + (row.minutes_worked || 0), 0);

    res.json({
      intern_id:     req.params.intern_id,
      total_sessions: rows.length,
      total_minutes:  totalMinutes,
      records:        rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/attendance/report/range?start=2025-01-01&end=2025-01-31
//
// Date-range report — returns all sessions within a window.
// Uses req.query to read ?start= and ?end= from the URL.

exports.getByDateRange = async (req, res) => {
  try {
    // req.query reads the ?key=value part of the URL
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Both ?start= and ?end= query params are required' });
    }

    const [rows] = await db.query(`
      SELECT
        a.*,
        i.first_name,
        i.last_name,
        d.name  AS department_name,
        TIMESTAMPDIFF(MINUTE, a.clock_in, a.clock_out) AS minutes_worked
      FROM attendance a
      JOIN intern     i ON a.intern_id     = i.id
      LEFT JOIN department d ON i.department_id = d.id
      WHERE DATE(a.clock_in) BETWEEN ? AND ?
      ORDER BY a.clock_in ASC
    `, [start, end]);

    res.json({
      from:    start,
      to:      end,
      count:   rows.length,
      records: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/attendance/:id
// Remove a single attendance record (for corrections/errors)

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
