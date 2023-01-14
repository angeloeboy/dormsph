const router = require('express').Router();

const multer = require('multer');
const serveStatic = require('serve-static');
const path = require('path');

const DormContoller = require('../controller/DormController');
const verify = require('./verifyToken');



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null,  Date.now() + ext);
  }
});
  
const upload = multer({ storage: storage });

// router.post("/", verify, upload.single("image"), (req, res) => {
//     // you can use req.file.path for the path of the uploaded file.
//     DormContoller.AddDorm(req, res);
// });

router.post("/", verify,  (req, res) => {
    DormContoller.AddDorm(req, res);
});

router.get("/", verify, upload.array('image', 3), (req, res) => {
    DormContoller.GetDorms(req, res);
});

// router.post("/info",   (req, res) => {
//     DormContoller.GetDormInfo(req, res);
// });

router.get("/:id",   (req, res) => {
    DormContoller.GetDormInfo(req, res);
});

router.post("/:id", verify,  (req, res) => {
  DormContoller.EditDorm(req, res);
});


router.delete("/:id", verify, (req,res) => {
  DormContoller.Deletedorm(req, res)
})

router.post("/images", verify, upload.array('image', 3), (req, res) => {
    console.log("dfdfdf")
    // DormContoller.uploadImage(req, res);
});


module.exports = router;


