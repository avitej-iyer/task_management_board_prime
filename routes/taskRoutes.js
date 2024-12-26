const express = require('express');
const { client } = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
const {ObjectId} = require('mongodb');

// Create a task
router.post('/', authMiddleware, async (req, res) => {
    const { title, description, status, assignedTo } = req.body;

    if (!title || !description) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const db = client.db('task_db');
        const tasks = db.collection('tasks');

        // Check if a task with the same title exists for this user
        const existingTask = await tasks.findOne({ title, createdBy: req.user.id });
        if (existingTask) {
            return res.status(400).send('Task with this title already exists');
        }

        const newTask = {
            title,
            description,
            status: status || 'To Do',
            assignedTo: assignedTo || null,
            createdBy: req.user.id,
            createdAt: new Date(),
        };

        const result = await tasks.insertOne(newTask);
        const insertedTask = { ...newTask, _id: result.insertedId };

        res.status(201).json(insertedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




// Get all tasks for the user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = client.db('task_db');
        const tasks = db.collection('tasks');

        // Find tasks created by the logged-in user
        const userTasks = await tasks.find({ createdBy: req.user.id }).toArray();
        res.status(200).json(userTasks);
    } catch (err) {
        console.error('Error fetching tasks:', err.message);
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params; // Extract the task ID from the URL
    const { title, description, status, assignedTo } = req.body;

    try {
        const db = client.db('task_db');
        const tasks = db.collection('tasks');


        const query = { _id: new ObjectId(id), createdBy: req.user.id.trim() }; // Trim whitespace
        console.log('Query Sent to MongoDB:', query);

        const updatedTask = await tasks.findOneAndUpdate(
            { _id: new ObjectId(id), createdBy: req.user.id },
            { $set: { title, description, status, assignedTo } },
            { returnDocument: 'after' }
        );

        if (!updatedTask) {
            console.error('Task not found or unauthorized');
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        res.status(200).json(updatedTask.value);
    } catch (err) {
        console.error('Error during task update:', err.message);
        res.status(500).json({ error: err.message });
    }
});




router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const db = client.db('task_db');
        const tasks = db.collection('tasks');

        // Delete the task
        const result = await tasks.deleteOne({ _id: new ObjectId(id), createdBy: req.user.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err.message);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
