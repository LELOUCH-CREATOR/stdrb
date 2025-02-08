const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

// Register route
router.post('/register', (req, res) => {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.error('Salt generation error:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            bcrypt.hash(password, salt, (err, hashedPassword) => {
                if (err) {
                    console.error('Password hashing error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                // Insert new user
                const query = 'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)';
                db.query(query, [fullName, email, hashedPassword], (err, result) => {
                    if (err) {
                        console.error('User insertion error:', err);
                        return res.status(500).json({ message: 'Server error' });
                    }

                    res.status(201).json({ message: 'Registration successful' });
                });
            });
        });
    });
});

// Login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        // Verify password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Password comparison error:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.user_id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.user_id,
                    fullName: user.full_name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    });
});

module.exports = router; 