
const router = require('express').Router();
var axios = require('axios');


router.get("/", async (req, res) => {

    
    try {
		const response = await axios.get("https://psgc.gitlab.io/api/provinces");
		console.log(response.data);
        res.send(response.data) 
	}
	catch (error) {
		console.log(error);
	}



})




module.exports = router;