const mongoose = require('mongoose');

const tasksSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },

image: {
  type: String, // Store the image reference here
},
});

module.exports = mongoose.model('Task', tasksSchema);

