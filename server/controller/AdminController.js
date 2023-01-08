
const bcrypt = require('bcryptjs')
const UserModel = require('../model/User.model')
const StoreModel = require("../model/Store.model")
const KeyModel = require("../model/Key.model")
const axios = require('axios');

const generateLicenseKey = require("@mcnaveen/license-gen");

const getsellixProducts = async (req, res) => {
    let productsArr = [];
    let  uniqIDarr = [];
    await axios.get(`https://dev.sellix.io/v1/products`, {
        headers:{
            "Authorization": `Bearer ${process.env.SELLIX_API_KEY}`,
        }
      })
      .then(function (response) {

        let products = response.data.data.products;
        products.map(product => {
            let productObj = {
                uniqid: product.uniqid}

            uniqIDarr.push(productObj);
        })

      })
      .catch(function (error) {
        console.log(error);
      });



    for(const product of uniqIDarr){
        await axios.get(`https://dev.sellix.io/v1/products/${product.uniqid}`, {
            headers:{
                "Authorization": `Bearer ${process.env.SELLIX_API_KEY}`,
            }
          })
          .then(function (response) {
            
            let product = response.data.data.product;

            let productObj = {
                id: product.uniqid,
                title: product.title,
                price: product.price,
                description: product.description,
                serials: product.serials
            }


            productsArr.push(productObj);
          })
          .catch(function (error) {
            console.log(error);
          });
          
    
    }

    if(productsArr.length > 0){
      res.json({error: 0, message: "Success", products: productsArr})
    }else{
      res.json({error: 1, message: "No products ", products: []})
    }

}

const getsellixProductsOnly = async (req, res) => {
    let productsArr = [];
    let  uniqIDarr = [];
    await axios.get(`https://dev.sellix.io/v1/products`, {
        headers:{
            "Authorization": `Bearer ${process.env.SELLIX_API_KEY}`,
        }
      })
      .then(function (response) {

        let products = response.data.data.products;
        productsArr.push(products);
      })
      .catch(function (error) {
        console.log(error);
      });


      if(productsArr.length > 0){
        res.json({error: 0, message: "Success", products: productsArr})
      }else{
        res.json({error: 1, message: "No products ", products: []})
      }
      
      console.log(productsArr)

}

const getKeys = async (req, res) => {
    const keys = await KeyModel.find()
    res.json({error: 0, message: "Success", keys: keys})   
}

const createKeys = async (req, res) => {

    let x = req.body.num;
    let days = req.body.week * 7;
    let i = 0
    let product = req.body.product;


    if(x == 0 || days == 0 ) return res.json({error: 1, message: "Invalid number of keys or days"})
    try {
        while(i < x){
            const myKey = generateLicenseKey(12);
    
            let keyExists = await KeyModel.findOne({key: myKey})
            
            if(!keyExists){
                const key = new KeyModel({
                    key: myKey,
                    validity: days,
                    used: false
                })
            
                //add keys to database
                await key.save()
                i++;
            }
        }
    
        let keys = await KeyModel.find();
        let keysArr = [];
    
        //check the validity of keys


        keys.forEach((key) => {

            if(days == key.validity && key.used == false){
                keysArr.push(key.key)
            }
        })                      
        

        try {
            //push keys to sellix, removes duplicates and adds new keys
            await keysToSellix(keysArr, product);
            res.json({error: 0, message: "Success"})
        } catch (error) {
            res.json({error: 1, message: "Error adding keys"})
        }


    } catch (error) {
        console.error('An error happened when creating the keys', error);
        res.json({error: 1, message: "Error adding keys"})
    }

}

const keysToSellix = async (keys, product) => {

    axios.put(`https://dev.sellix.io/v1/products/${product.id}`, {
        title: product.title,
        price: product.price_display,
        description: product.description,
        type: "SERIALS",
        serials_remove_duplicates: true,
        serials: keys
      }, {
        headers:{
            "Authorization": `Bearer ${process.env.SELLIX_API_KEY}`,
            "Content-Type": "application/json"
        }
      })
      .then(function (response) {
        // console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
}

const getStores = async (req, res) => {
    // const stores = await StoreModel.find()

    if(!req.body.name) return res.json({error: 1, message: "Invalid", stores: []})
    if(req.body.name.length == 0) return res.json({error: 1, message: "Invalid", stores: []})

    // res.json({error: 0, message: "Success", stores: stores})   
    const stores = await StoreModel.find({name: {$regex: req.body.name, $options: 'i'}})
    res.json({error: 0, message: "Success", stores: stores})
}



module.exports = {
    createKeys,
    getKeys,
    getStores,
    getsellixProducts,
    getsellixProductsOnly
}