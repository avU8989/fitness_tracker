const Workout = require('../models/Workout')

// POST /workouts - Log a new workout
exports.createWorkout = async(req, res) =>{
    try{
        const {type, duration, caloriesBurned, date} = req.body;
        //const userId = req.user.id;

        const newWorkout = new Workout({
            type,
            duration, 
            caloriesBurned,
            date,
            userId
        });

        const savedWorkout = await newWorkout.save();

        res.status(201).json({message: 'Workout logged successfully', workout: savedWorkout});

    }catch(error){
        res.status(500).json({message: 'Internal server error', error: error.message});
    }
};

// GET /workout - Retrieve workouts
exports.getWorkouts = async (req, res) => {
    try {
      const userId = req.user.id;
      const { date } = req.query;
  
      const query = { userId };
      if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
        query.date = { $gte: start, $lt: end };
      }
  
      const workouts = await Workout.find(query).sort({ date: -1 });
      res.status(200).json(workouts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch workouts', details: err.message });
    }
  };