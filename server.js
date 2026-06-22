const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;


// ✅ New Backend API

const ORIGINAL_API = "http://styosint.in/api/tg";
const BACKEND_KEY = "ftgamer";


// ✅ Your Public Keys

const VALID_KEYS = [
  "1month",
  "3month",
  "lifetime"
];


// ✅ Rate Limit

const LIMIT_PER_MINUTE = 5;
const LIMIT_PER_DAY = 500;

const rateStore = {};


function checkRateLimit(key) {

  const now = Date.now();

  if (!rateStore[key]) {

    rateStore[key] = {

      minute: {
        count: 0,
        resetAt: now + 60000
      },

      day: {
        count: 0,
        resetAt: now + 86400000
      }

    };

  }


  const store = rateStore[key];


  if (now > store.minute.resetAt) {

    store.minute = {
      count: 0,
      resetAt: now + 60000
    };

  }


  if (now > store.day.resetAt) {

    store.day = {
      count: 0,
      resetAt: now + 86400000
    };

  }


  if (store.minute.count >= LIMIT_PER_MINUTE) {

    return {
      allowed: false,
      error: "Max 5 request per minute",
      retryAfter:
        Math.ceil(
          (store.minute.resetAt - now) / 1000
        ) + "s"
    };

  }


  if (store.day.count >= LIMIT_PER_DAY) {

    return {
      allowed: false,
      error: "Daily 500 request limit finished"
    };

  }


  store.minute.count++;
  store.day.count++;


  return {
    allowed: true,
    remaining: {
      minute:
        LIMIT_PER_MINUTE -
        store.minute.count,

      day:
        LIMIT_PER_DAY -
        store.day.count
    }
  };

}


// Remove unwanted data

function cleanResponse(data) {

  const REMOVE_FIELDS = [
    "tag",
    "developer",
    "key_expiry"
  ];


  if (Array.isArray(data)) {

    return data.map(cleanResponse);

  }


  if (typeof data === "object" && data !== null) {

    let obj = {};

    for (let [k, v] of Object.entries(data)) {

      if (!REMOVE_FIELDS.includes(k)) {

        obj[k] = cleanResponse(v);

      }

    }

    return obj;

  }


  return data;

}



app.use(cors());
app.use(express.json());



// API Endpoint

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
      error: "id required"

    });

  }


  const limit = checkRateLimit(key);


  if (!limit.allowed) {

    return res.status(429).json({

      success:false,
      error:limit.error,
      retryAfter:limit.retryAfter

    });

  }


  try {


    const response = await axios.get(
      ORIGINAL_API,
      {
        params:{
          key: BACKEND_KEY,
          info: id
        },

        timeout:10000
      }
    );


    const cleaned =
      cleanResponse(response.data);


    res.set(
      "X-RateLimit-Minute",
      limit.remaining.minute
    );


    res.set(
      "X-RateLimit-Day",
      limit.remaining.day
    );


    res.json(cleaned);



  } catch (err) {


    console.log(
      "API ERROR:",
      err.message
    );


    res.status(500).json({

      success:false,
      error:"Backend API not responding"

    });


  }


});



// Home

app.get("/", (req,res)=>{

  res.json({
    status:"TG Proxy Running ✅"
  });

});



// Start

app.listen(PORT,()=>{

 console.log(`Server running on ${PORT}`);

});
