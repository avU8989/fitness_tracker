const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const openApiValidator = require('express-openapi-validator')
const YAML = require('yamljs')
const swaggerUi = require('swagger-ui-express');
const trainingPlanRoutes = require('./routes/trainingPlanRoutes');

const app = express()
const port = process.env.PORT || 5000;
const swaggerDocument = YAML.load('/home/avu/Downloads/fitness_tracker.yaml')

app.use(cors());
app.use(bodyParser.json());
app.use('/training-plans', trainingPlanRoutes);

mongoose.connect('mongodb://localhost:27017/fitnessTracker',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
    openApiValidator.middleware({
        apiSpec: '/home/avu/Downloads/fitness_tracker.yaml',
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

