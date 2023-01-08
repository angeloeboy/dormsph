const express = require('express')
const mongoose = require('mongoose')

require('dotenv').config()

const cors = require('cors');



// const admin = require("./config/admin.config")
// const config = require("./config/config.db")

// const bcrypt = require('bcryptjs')
// const UserModel = require('./model/User.model')

const cookieParser = require('cookie-parser')
const app = express();


app.use(cors({credentials: true, origin: true}))

// Connect to database
mongoose.connect(process.env.CONNECTION_STRING, () => {
  console.log('Connected to DB')
})

//ROUTES
const authRoute = require('./routes/auth.route');
const adminRoute = require('./routes/admin.route');
const userRoute = require('./routes/user.route');
const storesRoute = require("./routes/stores.route")

const placesRoute = require("./routes/places.route.js")

//Receive JSON DATA
app.use(cookieParser());

app.use(express.json());
//MIDDLEWARE

app.use('/api', authRoute);
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/stores', storesRoute);
app.use('/api/places', placesRoute);


app.listen(process.env.API_PORT, async () => {
  console.log('Server started on port ' + process.env.API_PORT)
  // await createAdmin();
})

// let createAdmin = async () => {

//     const userExist = await UserModel.findOne({username: admin.admin.username})

//     const salt = await bcrypt.genSalt(10)
//     const hashPassword = await bcrypt.hash(admin.admin.password, salt)

//     if (userExist) return console.log('The admin already exists');

//     const user = new UserModel({
//         username: admin.admin.username,
//         password: hashPassword,
//         role: "admin",
//         email: admin.admin.email
//     })
//     try{
//         await user.save()
//         console.log("The admin was created successfully")
//     }catch(err){
//         console.error('An error happened when creating the admin', e);
//     }
// }








