const router = require('express').Router();
const UserController = require('../controller/UserController');
const verify = require('./verifyToken');

router.get("/info", verify, (req, res) => {
    UserController.getInfo(req, res)
})

router.post("/redeem", (req, res) => {
    UserController.redeem(req, res)
})

//verification
router.get("/verify/:id/:token", async (req, res) => {
    UserController.verifyAccount(req, res);
});

router.post("/resend-verification", verify, async (req, res) => {
    UserController.sendVerification(req, res);
});

//request for reseting of password
router.post("/forgot-password", (req, res) => {
    UserController.forgotPassword(req, res);
})

//reset password
router.post("/reset-password", (req, res) => {
    UserController.resetPassword(req, res);
})

//store list 
router.get("/stores", verify, (req, res) => {
    UserController.getStores(req, res)
})


router.post("/validate-img", (req, res) => {
    UserController.validateImg(req, res);
})

module.exports = router;