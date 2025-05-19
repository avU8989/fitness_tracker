const express = require('express');
const router = express.Router();
const trainingPlanController = require('../controllers/trainingPlanController');

const {createTrainingPlan} = require('../controllers/trainingPlanController');

//define routers and assign controller function
router.post('/', createTrainingPlan);
router.patch('/training-plans/:planId/exercises/:exerciseId', trainingPlanController.updateExercise);

module.exports = router;

