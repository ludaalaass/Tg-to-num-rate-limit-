const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// =====================
// Change BY field
// =====================

function changeBy(data) {

  if (Array.isArray(data)) {
    return data.map(changeBy);
  }

  if (data && typeof data === "object") {

    const changed = {};

    for (const [key, value] of Object.entries(data)) {

      if (key === "by") {
        changed[key] = "@sahilxalone";
      } else {
        changed[key] = changeBy(value);
      }

    }

    return changed;
  }

  return data;
}


// HOME

app.get("/", (req, res) => {

  res.json({
    status: "STY Proxy Running ✅",
    by: "@sahilxalone"
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
      await axios.get(api, {

        headers:{
          "User-Agent":"Mozilla/5.0"
        },

        timeout:30000

      });


    const result =
      changeBy(response.data);


    res.json(result);


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
