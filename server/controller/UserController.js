const bcrypt = require('bcryptjs')

const UserModel = require('../model/User.model')
const jwt = require('jsonwebtoken')
const config = require('../config/config.db')
const fs = require("fs");
const TokenModel = require('../model/Token.model');
const crypto = require('crypto');
const axios = require('axios');
const email = require("../email.js")


const login = async (req, res) => {

    if (req.body.email === "" || req.body.password === "") return res.json({ error: 1, message: "Please fill in all fields" })
    const user = await UserModel.findOne({ email: req.body.email })


    if (!user)
        res.json({ error: 1, message: "User doesn't exist" })
    else {
        const validPass = await bcrypt.compare(req.body.password, user.password)

        if (!validPass) {
            res.json({ error: 1, message: "Invalid Password" })
        } else {
            //Create a token
            const token = jwt.sign({ _id: user._id, role: user.role }, config.TOKEN, { expiresIn: '1d' })

            res.cookie('token', token, { httpOnly: true, maxAge: (60 * 60 * 24 * 30) * 1000 }).json({ error: 0, token: token, message: "Successfully logged in", user: { username: user.username, role: user.role } })

        }
    }
}

const logout = async (req, res) => {

    res.clearCookie('token').json({ error: 0, message: "Successfully logged out" })
    res.end();
}

//creating account
const register = async (req, res) => {

    //Checking if all fields are filled
    if (req.body.email === "" || req.body.password === "" || req.body.accountType === "") return res.json({ error: 1, message: "Please fill in all fields" })


    let accountType = req.body.accountType.toLowerCase();
    //check account type
    if (accountType !== "renter" && accountType !== "owner") return res.json({ error: 1, message: "Invalid account type" })

    //check if user exists
    let userExist = await UserModel.findOne({ email: req.body.email })

    if (userExist) return res.json({ error: 1, message: "Email already exists" })

    
    //Hash Password
    // console.log(salt)

    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)


    const user = new UserModel({
        password: hashPassword,
        email: req.body.email,
        name: `${req.body.fname} ${req.body.lname}`,
        role: accountType,
        contact: req.body.contact
    })

    const token = new TokenModel({
        userId: user._id,
        email: req.body.email,
        uniqueString: crypto.randomBytes(32).toString("hex"),
        createdAt: new Date()
    })




    try {
        await user.save()
        await token.save()
        res.json({ error: 0, message: "Success" })

    } catch (err) {
        res.status(400).send(err)
    }


    // email.sendEmail(req.body.email, `${process.env.LINK}/verify?user_id=${user.id}&token=${token.uniqueString}`,  "Click here to verifiy your account",  "Verify Account", "Roses Market Verifiy Email")


}

const verifyAccount = async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.params.id });
        if (!user) return res.json({ error: 1, message: "User doesn't exist" })

        const token = await TokenModel.findOne({
            userId: user._id,
            token: req.params.token,
        });

        if (!token) return res.json({ error: 1, message: "Token doesn't exist" })

        await UserModel.findOneAndUpdate({ _id: user._id }, { verified: true });
        await TokenModel.findByIdAndDelete(token._id);

        res.json({ error: 0, message: "User verified" })
    } catch (error) {
        res.status(400).send(error);
    }
}

const sendVerification = async (req, res) => {

    const token = new TokenModel({
        userId: req.user._id,
        email: req.body.email,
        uniqueString: crypto.randomBytes(32).toString("hex"),
        createdAt: new Date()
    })

    try {
        token.save()
        // email.sendEmail(req.body.email, `${process.env.LINK}/verify?user_id=${req.user._id}&token=${token.uniqueString}`, "Click here to verifiy your account",  "Verify Account", "Roses Market Verifiy Email")

        res.json({ error: 0, message: "Email verification sent" })
    } catch (error) {
        res.json({ error: 1, message: "Something went wrong" })
    }
        
    



}

const getInfo = async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.user._id })
        if (!user) return res.json({ error: 1, message: "User doesn't exist" })

        let userInfo = {
            name: user.name,
            role: user.role,
            verified: user.verified,
            email: user.email,
            dorms: user.dorms
        }

        res.json({ error: 0, message: "Success", user: userInfo })
    } catch (error) {
        console.log(error)
        res.json({ error: 1, message: "Something went wrong" })
    }

}

//send reset password link to email
const forgotPassword = async (req, res) => {
    const user = await UserModel.findOne({ email: req.body.email })
    if (!user) return res.json({ error: 1, message: "Email doesn't exist" })

    const token = new TokenModel({
        userId: user._id,
        email: req.body.email,
        uniqueString: crypto.randomBytes(32).toString("hex"),
    })

    try {
        await token.save()
        // email.sendEmail(req.body.email, `${process.env.LINK}/forgot-password?user_id=${user.id}&token=${token.uniqueString}`, "Click here to reset your password", "Reset Password", "Roses Market Reset Password")

        res.json({ error: 0, message: "Password reset link sent to email", link: `http://${process.env.LINK}/forgot-password?user_id=${user.id}&token=${token.uniqueString}` })
    } catch (err) {
        res.status(400).send(err)
    }
}

//reset password via link
const resetPassword = async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.body.user_id });
        if (!user) return res.json({ error: 1, message: "Invalid link" });

        const token = await TokenModel.findOne({
            userId: req.body.user_id,
            uniqueString: req.body.token,
        });

        if (!token) return res.json({ error: 1, message: "Invalid link" });

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.password, salt)

        await UserModel.findOneAndUpdate({ _id: user._id }, { password: hashPassword });

        await TokenModel.findByIdAndDelete(token._id);
        res.json({ error: 0, message: "Password reset" })
    } catch (error) {
        res.status(400).send(error);
    }
}


const validateImg = async (img) => {
    let path = "";
    let valid = false;

    await axios.get(img)
        .then(response => {
            path = response.request.path;
        }).catch(function (error) {
            // console.log(error);
        });


    if (path !== "") {
        valid = true;
    } else {
        valid = false;
    }

    return valid;
}

module.exports = {
    login,
    getInfo,
    register,
    verifyAccount,
    forgotPassword,
    resetPassword,
    logout,
    validateImg,
    sendVerification
}