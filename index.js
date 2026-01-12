const express = require("express");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = "my_verify_token_123"; // SAME token jo Meta me dala hai

// ✅ Webhook verification (MOST IMPORTANT)
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// (Optional) POST — future messages ke liye
app.post("/", (req, res) => {
  console.log("📩 Webhook event:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
