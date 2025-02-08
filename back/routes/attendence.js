    const express = require('express');
    const router = express.Router();
    const db = require('../db'); // Ensure this points to your database connection module

    // Get all attendance records with student names
    router.get('/', (req, res) => {
        const query = `
            SELECT a.id, a.student_id, s.name AS student_name, a.date, a.status 
            FROM attendance a
            JOIN students s ON a.student_id = s.student_id
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching attendance records:', err);
                return res.status(500).json({ error: 'Failed to fetch attendance records' });
            }
            res.json(results);
        });
    });

    // Add a new attendance record
    router.post('/', (req, res) => {
        const { student_id, date, status } = req.body;

        // Validate input
        if (!student_id || !date || !status) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if the student exists
        db.query('SELECT * FROM students WHERE student_id = ?', [student_id], (err, results) => {
            if (err) {
                console.error('Error validating student:', err);
                return res.status(500).json({ error: 'Failed to validate student' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Student not found' });
            }

            // Insert the attendance record
            const insertQuery = 'INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)';
            db.query(insertQuery, [student_id, date, status], (err, results) => {
                if (err) {
                    console.error('Error adding attendance record:', err);
                    return res.status(500).json({ error: 'Failed to add attendance record' });
                }
                res.status(201).json({ message: 'Attendance record added', id: results.insertId });
            });
        });
    });

    // Delete an attendance record
    router.delete('/:id', (req, res) => {
        const id = req.params.id;

        // Validate input
        if (!id) {
            return res.status(400).json({ error: 'Attendance ID is required' });
        }

        // Delete the attendance record
        const deleteQuery = 'DELETE FROM attendance WHERE id = ?';
        db.query(deleteQuery, [id], (err, results) => {
            if (err) {
                console.error('Error deleting attendance record:', err);
                return res.status(500).json({ error: 'Failed to delete attendance record' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Attendance record not found' });
            }

            res.json({ message: 'Attendance record deleted' });
        });
    });

    // Add this route to your attendance.js
    router.get('/report', (req, res) => {
        const { startDate, endDate } = req.query;

        const query = `
            SELECT 
                s.student_id,
                s.name as studentName,
                COUNT(a.id) as totalDays,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentDays,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentDays
            FROM students s
            LEFT JOIN attendance a ON s.student_id = a.student_id
            WHERE a.date BETWEEN ? AND ?
            GROUP BY s.student_id, s.name
        `;

        db.query(query, [startDate, endDate], (err, results) => {
            if (err) {
                console.error('Report generation error:', err);
                return res.status(500).json({ error: 'Failed to generate report' });
            }

            const studentReports = results.map(row => ({
                studentName: row.studentName,
                totalDays: row.totalDays,
                presentDays: row.presentDays,
                absentDays: row.absentDays,
                attendancePercentage: (row.presentDays / row.totalDays) * 100
            }));

            const totalStudents = results.length;
            const totalAttendance = studentReports.reduce((sum, report) => sum + report.attendancePercentage, 0);
            const averageAttendance = totalStudents > 0 ? totalAttendance / totalStudents : 0;

            res.json({
                totalStudents,
                averageAttendance,
                studentReports
            });
        });
    }); 

    module.exports = router;