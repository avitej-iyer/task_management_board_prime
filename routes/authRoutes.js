const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { client } = require('../config/db');

const router = express.Router();

// Register a user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const db = client.db('task_db');
        const users = db.collection('users');

        // Check if user already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) return res.status(400).send('User already exists');

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const result = await users.insertOne({ name, email, password: hashedPassword });
        res.status(201).json({ userId: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const db = client.db('task_db');
        const users = db.collection('users');

        // Find the user
        const user = await users.findOne({ email });
        if (!user) return res.status(404).send('User not found');

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
