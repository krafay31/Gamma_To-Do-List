const express = require('express');
const router = express.Router();
const Task = require('./schema');
const User = require('./userSchema'); // Import the User model

// Middleware for user authentication
function authenticateUser(req, res, next) {
  const { email, password } = req.body;

  // Check if the user with the provided email and password exists in the database
  User.findOne({ email, password }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    req.user = user; // Store the user object in the request for future use
    next();
  });
}

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new task
router.post('/', authenticateUser, async (req, res) => {
  const { text } = req.body;
  if (text) {
    try {
      const newTask = new Task({ text, completed: false });
      const savedTask = await newTask.save();
      res.status(201).json(savedTask);
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(400).json({ message: 'Task text is required.' });
  }
});

// Mark a task as completed
router.put('/:id/complete', authenticateUser, async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findByIdAndUpdate(taskId, { completed: true }, { new: true });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json({ message: 'Task marked as completed.', task });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task text
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Task text is required.' });
    }
    const task = await Task.findByIdAndUpdate(taskId, { text }, { new: true });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json({ message: 'Task updated successfully.', task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const taskId = req.params.id;
    const result = await Task.deleteOne({ _id: ObjectId(taskId) });
    if (result.deletedCount > 0) {
      res.json({ message: 'Task deleted.' });
    } else {
      res.status(404).json({ message: 'Task not found.' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
