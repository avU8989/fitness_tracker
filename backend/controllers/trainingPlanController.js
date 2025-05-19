
const TrainingPlan = require('../models/TrainingPlan');

exports.createTrainingPlan = async (req, res) =>{
    try{
        const {name, exercises} = req.body;

    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: User ID missing' });
    }

    //logic to create a training plan
    const newPlan = new TrainingPlan({
        name,
        exercises,
        user: req.user.id
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

exports.getTrainingPlans = async (req,res) =>{
    try{
        const plans = await TrainingPlan.find({ user: req.user.id }); 
        console.log(plans);
        console.log(req.user.id);
        res.status(200).json(plans);
    }catch (error){
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
}

exports.updateExercise = async (req, res) => {
    const {sets, repetitions, weight} = req.body;
    const {planId, exerciseId} = req.params;

    try{
        const trainingPlan = await TrainingPlan.findOne({ _id: planId, user: req.user.id });
        if(!trainingPlan){
            return res.status(404).json({
                message: 'Training plan not found'
            });
        }

        const exercise = trainingPlan.exercises.id(exerciseId);
        if(!exercise){
            return res.status(404).json({
                message: 'Exercise not found'
            });
        }
        if (sets !== undefined) exercise.sets = sets;
        if (repetitions !== undefined) exercise.repetitions = repetitions;
        if (weight !== undefined) exercise.weight = weight;

        await trainingPlan.save();

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