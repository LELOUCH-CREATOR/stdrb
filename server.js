const express = require('express');
const cors = require('cors');
const Parser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('front')); // Serve static files from 'front' directory

// API Routes
app.use('/api/auth', require('./back/routes/auth'));
app.use('/api/students', require('./back/routes/students'));
app.use('/api/fees', require('./back/routes/fees'));
app.use('/api/attendance', require('./back/routes/attendence'));

// Default route handler
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});