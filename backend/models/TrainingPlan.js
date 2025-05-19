const mongoose = require('mongoose')

const exerciseSchema = new mongoose.Schema({
    name : String,
    sets : Number,
    repetitions: Number,
    weight: Number,
    unit: {
        type: String,
        enum: ['kg' , 'lbs'],
        required: true
    }
});

const trainingPlanSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    exercises: [exerciseSchema],
})

module.exports = mongoose.model('TrainingPlan', trainingPlanSchema);