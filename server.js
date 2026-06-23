const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// =====================
// Modify Response
// Change by + remove credits
// =====================

function modifyData(data) {

  if (Array.isArray(data)) {
    return data.map(modifyData);
  }

  if (data && typeof data === "object") {

    const changed = {};

    for (const [key, value] of Object.entries(data)) {

      // Remove API owner fields
      if (
        key === "tag" ||
        key === "developer" ||
        key === "key_expiry"
      ) {
        continue;
      }

      // Change by field
      if (key === "by") {
        changed[key] = "@sahilxalone";
      } else {
        changed[key] = modifyData(value);
      }

    }

    return changed;
  }

  return data;
}


// =====================
// HOME
// =====================

app.get("/", (req, res) => {

  res.json({
    status: "STY Proxy Running ✅",
    by: "@sahilxalone"
  });

});


// =====================
// TG API
// =====================

app.get("/tg", async (req, res) => {

  try {

    const search =
      req.query.info ||
      req.query.id;


    if (!search) {

      return res.json({
        success: false,
        error: "info required"
      });

    }


    const api =
      "https://api.igfollows.site/TG/index.php?type=user&key=OGGYxKRISH&term=" +
      encodeURIComponent(search);


    const response = await axios.get(api, {

      headers: {
        "User-Agent": "Mozilla/5.0"
      },

      timeout: 30000

    });


    const result = modifyData(response.data);


    res.json(result);


  } catch (e) {

    res.status(500).json({
      success: false,
      error: e.message
    });

  }

});


// =====================
// SERVER START
// =====================

app.listen(PORT, () => {
  console.log("Running on PORT " + PORT);
});
