const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String, 
    age: Number,
    height: Number,
    weight: Number
});

//need to hash password before saving
userSchema.pre('save', async function(next){
    if(!this.isModified('password'))
        return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePasswords = function(inputPassword) {
    return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);