
const router = require('express').Router();
const StoresController = require('../controller/StoresController');
const isAdmin = require('./isAdmin');

router.get("/", (req, res) => {
    StoresController.getStores(req, res)
})

router.get("/list", isAdmin, (req, res) => {
    StoresController.getStoresPaginated(req, res)
});

router.post("/search", (req, res) => {
    StoresController.searchStores(req, res)
});

// router.post("/delete", isAdmin, (req, res) => {
//     StoresController.searchStores(req, res)
// });




module.exports = router;