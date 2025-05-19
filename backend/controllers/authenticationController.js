const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
    try{
        const {username, email, age, height, password, weight} = req.body;

        const newUser = new User({
            username,
            email,
            password,
            age,
            height, 
            weight
        });

        await newUser.save();

        res.status(201).json({
            message: 'User successfully registered'
        })
    }catch(error){
        res.status(400).json({message: 'Bad request', error: error.message})
    }
}

exports.loginUser = async (req, res) =>{
    try{
        const {email, password} = req.body;

        //find the user
        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({message: 'Invalid email or password'});
        }

        //compare passwords
        const isMatch = await user.comparePasswords(password);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const token = jwt.sign(
            {id: user._id}, //payload with user id
            process.env.JWT_SECRET, //secret key (set in your environment variables)
            {expiresIn: '1d'}
        );
    
        res.status(200).json({ token });

    }catch(error){
        res.status(401).json({message: 'Unauthorized', error: error.message})
    }
}