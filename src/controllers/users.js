const bcrypt = require("bcrypt");
const User = require('../models/User');

const register = async (req,res,next) => {
    let {name,phoneNumber,email,userType,password} = req.body 

    try{
        let user = new User({
            name,
            phoneNumber,
            email,
            userType,
            password,
        })
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
       let createdUser = await user.save() 
       res.status(201).json({
        status : 'Success',
        data : {
            createdUser
        }
    })
    }catch(err){
        res.json({ error: err })
    }
}

module.exports = register