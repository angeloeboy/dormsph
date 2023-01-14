const express = require('express')
const mongoose = require('mongoose')

require('dotenv').config()

const cors = require('cors');

const multer = require('multer');
const serveStatic = require('serve-static');
const path = require('path');

const admin = require("./config/admin.config")
const config = require("./config/config.db")

const bcrypt = require('bcryptjs')
const UserModel = require('./model/User.model')

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
const dormRoute = require('./routes/dorm.route');
const placesRoute = require("./routes/places.route.js")

//Receive JSON DATA
app.use(cookieParser());

app.use(express.json());
//MIDDLEWARE

app.use('/api', authRoute);
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/places', placesRoute);
app.use('/api/dorms', dormRoute);

app.use('/api/uploads', serveStatic('uploads'));





app.listen(process.env.API_PORT, async () => {
  console.log('Server started on port ' + process.env.API_PORT)
  await createAdmin();
})

let createAdmin = async () => {

    const userExist = await UserModel.findOne({username: admin.admin.username})

    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(admin.admin.password, salt)

    if (userExist) return console.log('The admin already exists');

    const user = new UserModel({
        username: admin.admin.username,
        password: hashPassword,
        role: "admin",
        email: admin.admin.email
    })
    try{
        await user.save()
        console.log("The admin was created successfully")
    }catch(err){
        console.error('An error happened when creating the admin', e);
    }
}


// const fs = require('fs');
// const jsonString = fs.readFileSync("file.json", "utf-8");
// const jsonObj = JSON.parse(jsonString);


// function getProvinceList(jsonObj, filename) {
//   let provinces = []
//   Object.keys(jsonObj).map(regionKey => {
//       const region = jsonObj[regionKey];
//       const regionProvinceList = Object.keys(region.province_list);
//       regionProvinceList.map(provinceKey => {
//           let province = { province: provinceKey, municipalities: [] }
//           const municipalityList = Object.keys(region.province_list[provinceKey].municipality_list);
//           municipalityList.map(municipalityKey => {
//               let municipality = { name: municipalityKey, barangays: [] }
//               const barangayList = region.province_list[provinceKey].municipality_list[municipalityKey].barangay_list;
//               municipality.barangays = barangayList.sort()
//               province.municipalities.push(municipality)
//           });
//           provinces.push(province)
//       });
//   });

//   provinces.sort((a, b) => a.province.localeCompare(b.province));

//   provinces.forEach(province => {
//       province.municipalities.sort((a, b) => a.name.localeCompare(b.name))
//   });
//   fs.writeFileSync(filename, JSON.stringify(provinces));
//   return provinces;
// }

// const allProvincesArr = getProvinceList(jsonObj, 'provinces.json');
// console.log(allProvincesArr);








