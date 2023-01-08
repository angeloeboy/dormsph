const router = require('express').Router();
const isAdmin = require('./isAdmin');
const StoresController = require('../controller/StoresController');
const AdminController = require('../controller/AdminController');

//Cant be accessed without admin privileges
 

router.post("/keys", isAdmin, (req, res) => {
    AdminController.createKeys(req, res)
})

router.get("/keys", isAdmin, (req, res) => {
    AdminController.getKeys(req, res)
})

router.post("/delete-store", isAdmin, (req, res) => {
    StoresController.deleteStore(req, res)
})

router.get("/sellix-products", (req, res) => {
    AdminController.getsellixProducts(req, res)
})

router.get("/sellix-products-only", (req, res) => {
    AdminController.getsellixProductsOnly(req, res)
})



// router.post("/stores", (req, res) => {
//     AdminController.getStores(req, res)
// });



module.exports = router;