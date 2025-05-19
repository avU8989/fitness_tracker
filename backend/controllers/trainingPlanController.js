
const TrainingPlan = require('../models/TrainingPlan');

exports.createTrainingPlan = async (req, res) =>{
    try{
        const {name, exercises} = req.body;

    //logic to create a training plan
    const newPlan = new TrainingPlan({
        name,
        exercises,
    });

    await newPlan.save();

    res.status(201).json({
        message: 'Training plan created', 
        plan: newPlan
    });
    } catch (error){
        res.status(500).json({
            message: 'Internal server error', 
            error: error.message
        });
    }
};

exports.updateExercise = async (req, res) => {
    const {sets, repetitions, weight} = req.body;
    const {planId, exerciseId} = req.params;

    try{
        const plan = await this.createTrainingPlan.findById(planId);
        if(!plan){
            return res.status(404).json({
                message: 'Training plan not found'
            });
        }

        const exercise = plan.exercise.id(exerciseId);
        if(!exercise){
            return res.status(404).json({
                message: 'Exercise not found'
            });
        }
        exercise.sets = sets;
        exercise.repetitions = repetitions;
        exercise.weight = weight;

        await plan.save();

        res.status(200).json({
            message: 'Exercise updated successfully', exercise
        })
    }catch (error){
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
};