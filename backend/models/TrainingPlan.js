const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  repetitions: Number,
  weight: Number,
  unit: {
    type: String,
    enum: ["kg", "lbs"],
    required: true,
  },
});

const daySchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    required: true,
  },
  splitType: {
    type: String,
    required: true,
  },
  exercises: [exerciseSchema],
});

const trainingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  days: [daySchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("TrainingPlan", trainingPlanSchema);
