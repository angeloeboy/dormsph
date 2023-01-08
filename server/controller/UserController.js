const bcrypt = require('bcryptjs')

const UserModel = require('../model/User.model')
const jwt = require('jsonwebtoken')
const config = require('../config/config.db')
const fs = require("fs");
const KeyModel = require('../model/Key.model');
const StoreModel = require('../model/Store.model');
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
    if (req.body.email === "" || req.body.password === "") return res.json({ error: 1, message: "Please fill in all fields" })

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
        role: "user",
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


    email.sendEmail(req.body.email, `${process.env.LINK}/verify?user_id=${user.id}&token=${token.uniqueString}`,  "Click here to verifiy your account",  "Verify Account", "Roses Market Verifiy Email")


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
        email.sendEmail(req.body.email, `${process.env.LINK}/verify?user_id=${req.user._id}&token=${token.uniqueString}`, "Click here to verifiy your account",  "Verify Account", "Roses Market Verifiy Email")

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
            username: user.username,
            role: user.role,
            verified: user.verified,
            email: user.email
        }

        res.json({ error: 0, message: "Success", user: userInfo })
    } catch (error) {
        console.log(error)
        res.json({ error: 1, message: "Something went wrong" })
    }

}

const getStores = async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.user._id })
        const stores = await StoreModel.find({ owner: user.username })

        if (!user) return res.json({ error: 1, message: "User doesn't exist" })
        res.json({ error: 0, message: "Success", stores: stores })
    } catch (error) {
        res.json({ error: 1, message: "Something went wrong" })
    }

}

const redeem = async (req, res) => {

    let token = req.cookies.token;
    let user;
    let storeItem = req.body.store;
    let owner = " ";
    let keyString = req.body.key.replace(/\s+/g, '');

    try {
        const returnChar = /\n/gi;
        const a = storeItem.description.match(returnChar);

        if (storeItem.description.length > 200 || (a && a.length > 8)) {
            return res.json({ error: 1, message: "Characters Exceeded" });
        }
    } catch (error) {
        console.log(error)
    }

    const areTruthy = Object.values(storeItem).every(
        value => value !== "" && value !== null && value !== undefined && value !== " "
    );

    if (!areTruthy) return res.json({ error: 1, message: "Please fill in all fields" })

    const key = await KeyModel.findOne({ key: keyString })
    if (!key) return res.json({ error: 1, message: "Invalid key" })
    if (key.used) return res.json({ error: 1, message: "Key already redeemed" })


    let bannerValid = await validateImg(req.body.store.bannerimg);
    if (!bannerValid) return res.json({ error: 1, message: "Invalid banner image" });

    let pfpValid = await validateImg(req.body.store.pfpimg);
    if (!pfpValid) return res.json({ error: 1, message: "Invalid pfp image" });



    if (token) {
        try {
            const verified = jwt.verify(token, config.TOKEN)

            user = await UserModel.findOne({ _id: verified._id })
            owner = user.username;
        } catch (err) {
            owner = " ";
        }
    }


    let timeObject = new Date();
    let milliseconds = 20 * 1000; // 10 seconds = 10000 milliseconds
    timeObject = new Date(timeObject.getTime() + milliseconds);

    let addStore = {
        owner: owner,
        name: storeItem.name,
        type: storeItem.type,
        bannerimg: storeItem.bannerimg,
        pfpimg: storeItem.pfpimg,
        invitelink: storeItem.link,
        description: storeItem.description,
        datestarted: new Date(),
        expiration: setDateValidity(parseInt(key.validity)),
        color: storeItem.color,
        textcolor: storeItem.textcolor,
        expireAt: setDateValidity(parseInt(key.validity))
    }

    const store = new StoreModel(addStore)

    try {
        await store.save()
        await KeyModel.updateOne({ key: req.body.key }, { used: true });

        let stores = user.stores
        stores.push(addStore)
        await UserModel.updateOne({ _id: user._id }, { stores: stores })

        res.json({ error: 0, message: "Store added and key redeemed" })

    } catch (err) {
        res.status(400).send(err)
    }

}

const setDateValidity = (validity) => {
    let date = new Date();
    date.setDate(date.getDate() + validity);
    return date;
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
        email.sendEmail(req.body.email, `${process.env.LINK}/forgot-password?user_id=${user.id}&token=${token.uniqueString}`, "Click here to reset your password", "Reset Password", "Roses Market Reset Password")

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
    redeem,
    verifyAccount,
    forgotPassword,
    resetPassword,
    logout,
    getStores,
    validateImg,
    sendVerification
}