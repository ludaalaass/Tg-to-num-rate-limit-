const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Your API Key
const API_KEY = "OGGYxKRISH";

app.use(cors());
app.use(express.json());

// Home Page
app.get("/", (req, res) => {
    res.json({
        status: true,
        message: "API is running successfully.",
        developer: "@sahilxalone",
        contact: "https://t.me/sahilxalone"
    });
});

// Proxy API
// Example:
// /TG/free/=123456789
// /TG/user/=123456789

app.get("/TG/:type/=:term", async (req, res) => {
    try {
        const { type, term } = req.params;

        const url = `https://api.igfollows.site/TG/index.php?type=${encodeURIComponent(type)}&key=${API_KEY}&term=${encodeURIComponent(term)}`;

        const response = await axios.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        let data = response.data;

        if (typeof data === "object" && data !== null) {
            // Replace developer info
            if ("tag" in data) data.tag = "@sahilxalone";
            if ("developer" in data) data.developer = "@sahilxalone";

            // Remove key_expiry if present
            delete data.key_expiry;
        }

        res.status(response.status).json(data);

    } catch (err) {
        if (err.response) {
            return res.status(err.response.status).send(err.response.data);
        }

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        status: false,
        message: "Invalid Endpoint",
        developer: "@sahilxalone",
        contact: "https://t.me/sahilxalone"
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
