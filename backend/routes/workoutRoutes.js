const express = require('express')
const router = express.Router();
const workoutController = require('../controllers/workoutController')
const authMiddleware = require('../middleware/auth')

router.post('/workouts', authMiddleware, workoutController.createWorkout);
router.get('/workouts', authMiddleware, workoutController.getWorkouts);

module.exports = router;