const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// =====================
// RATE LIMIT
// =====================

// 5 requests per minute
const minuteLimit = rateLimit({

  windowMs: 60 * 1000,

  max: 5,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success:false,
    error:"Too many requests. Max 5 requests per minute"
  }

});


// 500 requests per day
const dailyLimit = rateLimit({

  windowMs: 24 * 60 * 60 * 1000,

  max: 500,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success:false,
    error:"Daily limit reached. Max 500 requests per day"
  }

});




// =====================
// MAIN API
// =====================

app.get("/tg", minuteLimit, dailyLimit, async (req,res)=>{


 const { key, id } = req.query;


 if(key !== "1month"){

  return res.status(401).json({

   success:false,

   error:"Invalid API key"

  });

 }



 if(!id){

  return res.status(400).json({

   success:false,

   error:"id required"

  });

 }



 try{


 const api =
 `https://api.igfollows.site/TG/index.php?type=user&key=OGGYxKRISH&term=${encodeURIComponent(id)}`;



 const response = await fetch(api);



 let data = await response.json();




 // REMOVE OLD API DETAILS

 delete data.tag;

 delete data.developer;

 delete data.key_expiry;




 // ADD YOUR CREDIT

 data.developer = "@sahilxalone";




 return res.json(data);



 }catch(e){


 return res.status(500).json({

  success:false,

  error:"API fetch failed"

 });


 }



});




// =====================
// HOME
// =====================

app.get("/",(req,res)=>{


 res.json({

  status:"ONLINE ✅",

  api:"/tg?key=1month&id=123456789",

  limit:"5/min | 500/day",

  developer:"@sahilxalone"

 });


});




// HEALTH

app.get("/health",(req,res)=>{


 res.json({

  status:"OK",

  developer:"@sahilxalone",

  time:new Date().toISOString()

 });


});




// START

app.listen(PORT,()=>{

 console.log(`🚀 Server running on ${PORT}`);

});
