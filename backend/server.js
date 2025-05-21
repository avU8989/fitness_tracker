require('dotenv').config();

const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const openApiValidator = require('express-openapi-validator')
const YAML = require('yamljs')
const swaggerUi = require('swagger-ui-express');
const trainingPlanRoutes = require('./routes/trainingPlanRoutes.js');
const workoutRoutes = require('./routes/workoutRoutes.js');
const authMiddleware = require('./middleware/auth.js');
const authenticationRoutes = require('./routes/authenticationRoutes.js');
const app = express();
const port = process.env.PORT || 5000;
const swaggerDocument = YAML.load(process.env.OPEN_API_DESIGN)

app.use(cors());
app.use(bodyParser.json());
app.use('/training-plans', authMiddleware, trainingPlanRoutes);
app.use('/auth', authenticationRoutes);
app.use('/workouts', authMiddleware, workoutRoutes);

mongoose.connect(process.env.MONGODB_URI);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
    openApiValidator.middleware({
        apiSpec: process.env.OPEN_API_DESIGN,
        validatorRequests: true,
        validatorResponses: true,
    })
);

app.use(express.json());

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

//define routers
app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})

