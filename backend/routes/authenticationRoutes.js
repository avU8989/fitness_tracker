const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');

router.post('/register', authenticationController.createUser);
router.post('/login', authenticationController.loginUser);

module.exports = router;