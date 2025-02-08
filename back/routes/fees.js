const express = require('express');
const db = require('../db');
const router = express.Router();


router.get('/', (req, res) => {
    const sql = `
        SELECT fees.*, students.name AS student_name 
        FROM fees 
        JOIN students ON fees.student_id = students.student_id
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});
router.get('/:id', (req, res) => {
    const sql = `
        SELECT fees.*, students.name AS student_name 
        FROM fees 
        JOIN students ON fees.student_id = students.student_id
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});


router.put('/', (req, res) => {
    const { id } = req.params;
    const { student_id, fee_amount, paid_date, status } = req.body;

    if (!student_id || !fee_amount || !paid_date || !status) {
        return res.status(400).send('All fields are required');
    }

    const sql = `
        UPDATE fees 
        SET student_id = ?, fee_amount = ?, paid_date = ?, status = ? 
        WHERE fee_id = ?
    `;
    db.query(sql, [student_id, fee_amount, paid_date, status, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Fee updated successfully');
    });
});

router.post('/', (req, res) => {
    const { student_id, fee_amount, paid_date, status } = req.body;

    // Enhance validation
    if (!student_id || isNaN(fee_amount) || !paid_date || !status) {
        return res.status(400).json({ 
            error: 'Invalid input', 
            details: 'All fields are required and must be valid' 
        });
    }

    const sql = `
        INSERT INTO fees (student_id, fee_amount, paid_date, status) 
        VALUES (?, ?, ?, ?)
    `;
    
    db.query(sql, [student_id, fee_amount, paid_date, status], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: 'Error adding fee', 
                details: err.message 
            });
        }
        
        res.status(201).json({ 
            message: 'Fee added successfully', 
            fee_id: results.insertId 
        });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM fees WHERE fee_id = ?';
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Fee deleted successfully');
    });
});

module.exports = router