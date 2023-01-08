const jwt = require('jsonwebtoken')
const config = require('../config/config.db');
const UserModel = require('../model/User.model');

module.exports = async (req, res, next) => {
    // const token = req.header('auth-token');
    const token = req.cookies.token;

    if(!token){
        res.status(401).json({error: 1, message: "Access Denied"})

    }else{
        try{
            const verified = jwt.verify(token, config.TOKEN)
            
            const user = await UserModel.findById(verified._id)
            if(user.role == "admin"){
                req.user = verified
                next()
            }else{
                res.status(401).json({error: 1, message: "Access Denied"})

            }
          
        }catch(err){
            res.status(400).json({error: 1, message: "Invalid token"})

        }
    }
}