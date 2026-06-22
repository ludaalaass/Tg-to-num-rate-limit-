const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;


// ======================
// STY API CONFIG
// ======================

const API_URL = "http://styosint.in/api/tg";
const API_KEY = "ftgamer";


// ======================
// YOUR KEYS
// ======================

const VALID_KEYS = [
  "1month",
  "3month",
  "lifetime"
];

app.use(cors());
app.use(express.json());


// HOME CHECK

app.get("/", (req, res) => {

  res.json({
    status: "STY Proxy Running ✅",
    developer: "Aura"
  });

});


// TG API
// /tg?key=1month&id=123456789


app.get("/tg", async (req, res) => {

  const { key, id } = req.query;


  if (!key || !VALID_KEYS.includes(key)) {

    return res.status(403).json({
      success: false,
      error: "Invalid API key"
    });

  }


  if (!id) {

    return res.status(400).json({
      success: false,
      error: "id parameter required"
    });

  }


  try {


    const response = await axios.get(API_URL, {

      params: {
        key: API_KEY,
        info: id
      },


      headers: {

        "User-Agent":
        "Mozilla/5.0",

        "Accept":
        "*/*"

      },


      timeout: 30000

    });


    // Return STY response directly

    return res
      .status(200)
      .json(response.data);



  } catch (error) {


    console.log(
      "STY API ERROR:",
      error.message
    );


    return res.status(500).json({

      success:false,
      error:"STY API request failed"

    });


  }


});



// SERVER START


app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});
