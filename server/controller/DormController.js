

const DormModel = require('../model/Dorm.model');
const UserModel = require('../model/User.model');




const uploadImage = (req, res) => {
    // console.log(req.files)
    // console.log("Error here?")
    // let imglinks = [];
    // req.files.forEach(file => {

    //     imglinks.push(file.path);
    // });

    // res.json({imgLink: imglinks})
    console.log("dfdf")
}

const AddDorm = async( req, res) => {

    let dormInfo = req.body;
    // let dormInfo = req.body
    const user = await UserModel.findOne({ _id: req.user._id })
    if (!user) return res.status(400).send("Invalid user");


    console.log(dormInfo)

    const Dorm = new DormModel({
        owner: user.name,
        name: dormInfo.name,
        province: dormInfo.province,
        city: dormInfo.city,
        barangay: dormInfo.barangay,
        description: dormInfo.description,
        dateposted: new Date(),
        images: dormInfo.imgLinks,
        price: dormInfo.price,
        address: dormInfo.address,
        tenant: dormInfo.tenants,
        ammeneties: dormInfo.ammeneties
    })

    try {


        // Dorm.save((err, dorm) => {
        //     if (err) throw err;
        //     // Find the user to update by id
        //     UserModel.findByIdAndUpdate( req.user._id, { $push: {dorms:  Dorm._id} }, { new: true }, (err, user) => {
        //         if (err){
        //             console.log("error here")
        //             throw err;
        //         } 
        //         console.log("User successfully edited")
        //         res.json({ error: 0, message: "Success" })

        //     });
        // });

    } catch (err) {
        res.status(400).send(err)
    }
    
}

const EditDorm = async(req, res) => {
    let dormId = req.params.id
    let DormInfo = await DormModel.findById(dormId)
    let dormInfo = req.body;
    console.log(dormInfo)
    if(!DormInfo) return res.json({error: 1, message: "Invalid Id"})

    const result = await DormModel.updateOne(
        { _id: dormId },
        {
          $set: {
            owner: dormInfo.owner,
            name: dormInfo.name,
            province: dormInfo.province,
            city: dormInfo.city,
            barangay: dormInfo.barangay,
            tenants: dormInfo.tenants,
            description: dormInfo.description,
            ameneties: dormInfo.ameneties,
            address: dormInfo.address,
            landmark: dormInfo.landmark,
            price: dormInfo.price,

          }
        }
      );
      console.log(result);

}

const Deletedorm = async(req, res) => {
    // try {
    //     const id = req.params.id;
    //     console.log(id)
    //     await DormModel.findByIdAndDelete(id);

    //     res.json({error: 0, message: "Succesfully Deleted"})
    //   } catch (err) {
    //     res.json({error: 1, message: err})
    //   }
}

const GetDorms = async (req, res) => {
    const dorms = await DormModel.find();

    res.json({dorms: dorms})
}


const GetDormInfo = async (req, res) => {

    try {
        let dormId = req.params.id
        console.log(dormId)
        let DormInfo = await DormModel.findById(dormId)

        if(DormInfo) return res.json({error: 0, message: "", info: DormInfo})

        res.json({error: 1, message: "Dorm not found",})
    } catch (error) {
        res.json({error: 0, message: "Error Happened"})
    }

}

module.exports = {
    AddDorm,
    EditDorm,
    Deletedorm,
    uploadImage,
    GetDorms,
    GetDormInfo
}