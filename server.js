const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());


// Home

app.get("/", (req, res) => {
  res.json({
    status: "STY Proxy Running ✅"
  });
});


// API

app.get("/tg", async (req, res) => {

  try {

    const search =
      req.query.info ||
      req.query.id;


    if (!search) {
      return res.json({
        success:false,
        error:"info required"
      });
    }


    const api =
      "http://styosint.in/api/tg?key=ftgamer&info=" +
      encodeURIComponent(search);


    const response =
      await axios.get(api);


    res.send(response.data);


  } catch (e) {

    res.status(500).json({
      success:false,
      error:e.message
    });

  }

});


app.listen(PORT, () => {
  console.log("Running " + PORT);
});
