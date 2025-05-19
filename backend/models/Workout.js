const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
  },
  caloriesBurned: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Workout', workoutSchema);