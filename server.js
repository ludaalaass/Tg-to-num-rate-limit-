const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;


// Backend API

const BACKEND_URL = "http://styosint.in/api/tg";
const BACKEND_KEY = "ftgamer";


// Your keys

const VALID_KEYS = [
  "1month",
  "3month",
  "lifetime"
];


app.use(cors());
app.use(express.json());


// Main API
// /tg?key=1month&id=username

app.get("/tg", async (req, res) => {

  const { key, id } = req.query;


  if (!key || !VALID_KEYS.includes(key)) {
    return res.status(403).json({
      success:false,
      error:"Invalid key"
    });
  }


  if (!id) {
    return res.status(400).json({
      success:false,
      error:"id required"
    });
  }


  try {

    const url =
      `${BACKEND_URL}?key=${BACKEND_KEY}&info=${encodeURIComponent(id)}`;


    const response = await axios.get(url, {

      headers:{
        "User-Agent":"Mozilla/5.0"
      },

      timeout:30000

    });


    // direct same response return
    return res
      .status(200)
      .send(response.data);



  } catch (err) {


    console.log(err.message);


    return res.status(500).json({

      success:false,
      error:"API fetch failed"

    });


  }


});


// Home

app.get("/", (req,res)=>{

  res.json({
    status:"Running ✅"
  });

});


app.listen(PORT,()=>{

 console.log(`Server running on ${PORT}`);

});
