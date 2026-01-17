const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ===== CONFIG =====
const VERIFY_TOKEN = "my_verify_token_123";
const ACCESS_TOKEN = "EAAgoFTbnfj4BQQPfzGLCTXkmPxQfI9O9ZCwUqBnZA1XZA8zrhOWjmq33EdEACSgURH8qv97Jc1LRYZB3TKpH3EmZBkZAYu8CtyZBbHEuT2vRuoAVsYHCScRf00P11mT4WfWo7O2HBA9raHq5ikKP4hznZAy03vZCnQVLwly4TA5XR067zclbqjBQQ5IQRawVgUgZDZD";
const PHONE_NUMBER_ID = "977024415487285";
const TEMPLATE_NAME = "payment_confirmation";

// ===== META VERIFY =====
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Meta webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ===== PHONEPE WEBHOOK =====
app.post("/phonepe", async (req, res) => {
  console.log("💰 Payment Event:", JSON.stringify(req.body, null, 2));

  try {
    const data = req.body;

    // Example mapping — adjust if PhonePe format differs
    const phone = data.payload.customerPhone;
    const name = data.payload.customerName || "Student";
    const course = data.payload.courseName || "Your Course";
    const amount = data.payload.amount;
    const txnId = data.payload.transactionId;

    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: TEMPLATE_NAME,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: name },
                { type: "text", text: course },
                { type: "text", text: amount.toString() },
                { type: "text", text: txnId },
                { type: "text", text: new Date().toLocaleDateString() },
                { type: "text", text: new Date().toLocaleTimeString() }
              ]
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ WhatsApp payment message sent");
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error sending WhatsApp:", err.response?.data || err.message);
    res.sendStatus(500);
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
