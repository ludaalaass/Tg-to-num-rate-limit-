const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Original API config
const ORIGINAL_API = "https://api.igfollows.site/TG/index.php";
const BACKEND_KEY = "OGGYxKRISH";
const API_TYPE = "user";

// ✅ Valid keys
const VALID_KEYS = [
  "1month",
  "3month",
  "lifetime",
  // aur keys yahan add karo
];

// ✅ Rate limit config
const LIMIT_PER_MINUTE = 5;
const LIMIT_PER_DAY = 500;

// In-memory store
const rateStore = {};

function checkRateLimit(key) {
  const now = Date.now();

  if (!rateStore[key]) {
    rateStore[key] = {
      minute: {
        count: 0,
        resetAt: now + 60 * 1000,
      },
      day: {
        count: 0,
        resetAt: now + 24 * 60 * 60 * 1000,
      },
    };
  }

  const store = rateStore[key];

  if (now > store.minute.resetAt) {
    store.minute = {
      count: 0,
      resetAt: now + 60 * 1000,
    };
  }

  if (now > store.day.resetAt) {
    store.day = {
      count: 0,
      resetAt: now + 24 * 60 * 60 * 1000,
    };
  }

  if (store.minute.count >= LIMIT_PER_MINUTE) {
    return {
      allowed: false,
      error: "Rate limit exceeded: max 5 requests per minute.",
      retryAfter:
        Math.ceil((store.minute.resetAt - now) / 1000) + "s",
    };
  }

  if (store.day.count >= LIMIT_PER_DAY) {
    return {
      allowed: false,
      error: "Daily limit exceeded: max 500 requests per day.",
      retryAfter:
        Math.ceil((store.day.resetAt - now) / 1000) + "s",
    };
  }

  store.minute.count++;
  store.day.count++;

  return {
    allowed: true,
    remaining: {
      minute: LIMIT_PER_MINUTE - store.minute.count,
      day: LIMIT_PER_DAY - store.day.count,
    },
  };
}

// ✅ Remove unwanted fields
function cleanResponse(data) {
  const REMOVE_FIELDS = [
    "tag",
    "developer",
    "key_expiry"
  ];

  if (Array.isArray(data)) {
    return data.map((item) => cleanResponse(item));
  }

  if (typeof data === "object" && data !== null) {
    const cleaned = {};

    for (const [k, v] of Object.entries(data)) {
      if (!REMOVE_FIELDS.includes(k)) {
        cleaned[k] = cleanResponse(v);
      }
    }

    return cleaned;
  }

  return data;
}

app.use(cors());
app.use(express.json());


// ✅ Main API
// Example: /tg?key=1month&id=username

app.get("/tg", async (req, res) => {

  const { key, id } = req.query;

  if (!key || !VALID_KEYS.includes(key)) {
    return res.status(403).json({
      success: false,
      error: "Invalid key. Access denied.",
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "id parameter required",
    });
  }

  const limit = checkRateLimit(key);

  if (!limit.allowed) {
    return res.status(429).json({
      success: false,
      error: limit.error,
      retryAfter: limit.retryAfter,
    });
  }

  try {

    const response = await axios.get(
      ORIGINAL_API,
      {
        params: {
          type: API_TYPE,
          key: BACKEND_KEY,
          term: id,
        },
        timeout: 10000,
      }
    );

    const cleaned = cleanResponse(response.data);

    res.set(
      "X-RateLimit-Remaining-Minute",
      limit.remaining.minute
    );

    res.set(
      "X-RateLimit-Remaining-Day",
      limit.remaining.day
    );

    res.status(200).json(cleaned);

  } catch (error) {

    console.error(
      "API Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      error: "Backend API se response nahi aaya",
    });

  }

});


// ✅ Health check

app.get("/", (req, res) => {
  res.json({
    status: "Server chal raha hai ✅"
  });
});


// ✅ Start server

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
