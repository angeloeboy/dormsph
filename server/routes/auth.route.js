const router = require('express').Router();
const UserController = require('../controller/UserController');
const verify = require('./verifyToken');

router.post('/login', (req, res) => {
    UserController.login(req, res)
})

router.post("/register", (req, res) => {
    UserController.register(req, res);
})

router.get("/logout", (req, res) => {
    UserController.logout(req, res);
})


module.exports = router;