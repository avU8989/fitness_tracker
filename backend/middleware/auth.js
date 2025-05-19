const jwt = require('jsonwebtoken')

module.exports = (req, res, next) =>{
    //get auth header
    const authHeader = req.headers.authorization;

    //check if it exists and start with a bearer
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({error: 'Unauthorized: No token provided'});
    }

    //extract token from header
    const token = authHeader.split(' ')[1];

    try{
        //verify token with JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //attach user info to request object
        req.user = {id: decoded.id};

        //proceed to next middleware or route handler
        next();
    } catch(error){
        res.status(401).json({error: 'Unauthorized: Invalid provided'})
    }
}