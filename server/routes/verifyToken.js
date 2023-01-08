const jwt = require('jsonwebtoken')
const config = require('../config/config.db')

module.exports = (req, res, next) => {
    // const token = req.header('auth-token');
    const token = req.cookies.token;
    
    if(!token){
        res.status(401).json({error: 1, message: "Access Denied"})
    }else{
        try{
            const verified = jwt.verify(token, config.TOKEN)
            req.user = verified
            next()
        }catch(err){
            res.status(400).json({error: 1, message: "Invalid token"})
        }
    }
}