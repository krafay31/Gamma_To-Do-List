const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const app = express();
const PORT = 3000;
const cors = require('cors');
const session = require('express-session');

const mongoURL = 'mongodb+srv://GammaCities:RafayRehman1@gammacities.7guo0w9.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB URL
const dbName = 'GammaCities'; 

// Middleware to parse JSON data
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON data

app.use(bodyParser.urlencoded({ extended: true }));

// Mongoose connection
mongoose
  .connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true, dbName: dbName })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// User model
const User = require('./user');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

const flash = require('connect-flash');
app.use(flash());


const authRoutes = require('./auth'); // Update the path based on your project structure
app.use('/', authRoutes);

app.use((req, res, next) => {
    res.locals.errorMessage = req.flash('error');
    next();
});

// Import the Mongoose model
const Task = require('./schema');

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/login');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.redirect('/todo');
    } else {
      // Passwords do not match, redirect back to login page with error message
      res.redirect('/login?error=invalid_password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.redirect('/login?error=login_error');
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
      const { email, password } = req.body;

      // Check if a user with the same email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          req.flash('error', 'Email already registered');
          return res.redirect('/register');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
          email: email,
          password: hashedPassword
      });

      // Attempt to save the user to the database
      await user.save();
      console.log('User registered successfully:', user);
      res.redirect('/login');
  } catch (error) {
      console.error('Error registering user:', error);
      res.redirect('/register');
  }
});




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
app.get('/todo', async (req, res) => {
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

