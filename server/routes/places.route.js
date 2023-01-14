
const router = require('express').Router();
var axios = require('axios');
const fs = require('fs');

router.get("/", async (req, res) => {

    
	await fs.readFile('provinces.json', 'utf8', (err, data) => {
        if (err) throw err;
        res.json(JSON.parse(data));
    });
})



module.exports = router;