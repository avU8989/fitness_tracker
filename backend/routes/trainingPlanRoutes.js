const express = require('express');
const router = express.Router();
const trainingPlanController = require('../controllers/trainingPlanController');
const auth = require('../middleware/auth.js');
const {createTrainingPlan} = require('../controllers/trainingPlanController');

//define routers and assign controller function
router.post('/', createTrainingPlan);
router.patch('/:planId/exercises/:exerciseId', trainingPlanController.updateExercise);
router.get('/', auth, trainingPlanController.getTrainingPlans);
module.exports = router;

