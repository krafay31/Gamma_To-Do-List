const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ObjectId = require('mongoose').Types.ObjectId;

// Set up the storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // Change this to your desired directory
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// Route handler to handle adding an image to a task
router.post('/tasks/:id/add-image', upload.single('image'), async (req, res) => {
  try {
    const taskId = req.params.id;
    const imageReference = req.file.filename; // Store the image file name or path

    // Update the task in the database with the new image reference
    const updatedTask = await Task.findByIdAndUpdate(taskId, { image: imageReference }, { new: true });

    // Respond with the image reference
    res.json({ success: true, imageReference });
  } catch (error) {
    console.error('Error adding image to task:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


module.exports = router;