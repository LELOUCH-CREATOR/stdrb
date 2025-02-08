const express = require('express');
const db = require('../db');
const router = express.Router();


// Protect all routes


// Get all students 
router.get('/', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Add a new student
router.post('/', (req, res) => {  
  const { name, roll_number, class: studentClass, parent_contact } = req.body;

  if (!name || !roll_number || !studentClass || !parent_contact) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  // Insert the student data without including the 'id', which will be auto-generated
  db.query('INSERT INTO students (name, roll_number, class, parent_contact) VALUES (?, ?, ?, ?)', 
      [name, roll_number, studentClass, parent_contact], 
      (err, results) => {
          if (err) {
              console.error('Error adding student:', err);
              return res.status(500).send(err);
          }
          // Send back the automatically generated studentId
          res.send({ message: 'Student added', studentId: results.insertId });
      });
});

// Delete a student by ID
// delete a student
// Delete a student by ID
router.delete('/:id', async (req, res) => {
    const studentId = req.params.id;

    try {
        // Delete related records in `fees` and `attendance`
        await db.query('DELETE FROM fees WHERE student_id = ?', [studentId]);
        await db.query('DELETE FROM attendance WHERE student_id = ?', [studentId]);

        // Delete the student
        const query = 'DELETE FROM students WHERE student_id = ?';
        const result = await db.query(query, [studentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});


// Update student details
// Update student details
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, roll_number, class: studentClass, parent_contact } = req.body;

  if (!name || !roll_number || !studentClass || !parent_contact) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  db.query('UPDATE students SET name = ?, roll_number = ?, class = ?, parent_contact = ? WHERE student_id = ?', 
      [name, roll_number, studentClass, parent_contact, id], 
      (err, results) => {
          if (err) {
              console.error('Error updating student:', err);
              return res.status(500).send(err);  // Send detailed error response to help debugging
          }
          res.send({ message: 'Student updated' });
      });
});

// Search for students by name
router.get('/search', async (req, res) => {
    try {
        const { search } = req.query;
        const results = await db.promise().query('SELECT * FROM students WHERE name LIKE ?', [`%${search}%`]);
        res.json(results[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

// Get a student by ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM students WHERE student_id = ?', [id], (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length === 0) return res.status(404).send({ message: 'Student not found' });
      res.json(results[0]);
  });
});


module.exports = router;
