const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = 3000;
const cors = require('cors');

const mongoURL = 'mongodb+srv://GammaCities:RafayRehman1@gammacities.7guo0w9.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB URL
const dbName = 'GammaCities'; // Replace with your preferred database name

// Middleware to parse JSON data
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Mongoose connection
mongoose
  .connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true, dbName: dbName })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Import the Mongoose model
const Task = require('./schema');

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Route handler for the root URL '/'
app.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.render('To-Do-List', { tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new task to the database
app.post('/api/tasks', async (req, res) => {
  try {
    const { text } = req.body; 
    if (text) {
      const newTask = new Task({ text, completed: false });
      const savedTask = await newTask.save();
      res.status(201).json(savedTask);
    } else {
      res.status(400).json({ message: 'Task text is required.' });
    }
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a task as completed
app.put('/api/tasks/:id/complete', async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    task.completed = true;
    await task.save();
    res.json({ message: 'Task marked as completed.' });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task text
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Task text is required.' });
    }
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    task.text = text;
    await task.save();
    res.json({ message: 'Task updated successfully.' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const result = await Task.deleteOne({ _id: taskId }); // Use deleteOne instead of remove
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





app.listen(PORT, () => {
  console.log('Server listening on PORT', PORT);
});

