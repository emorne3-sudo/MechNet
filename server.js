const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- DIAGNOSTIC LOG ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.log("❌ ERROR: No API Key found in Environment Variables!");
} else {
    console.log("✅ API Key detected. Length:", apiKey.length);
}
// ----------------------

const genAI = new GoogleGenerativeAI(apiKey || "missing");

app.post("/ask-mechbot", async (req, res) => {
    try {
        const { question } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`You are a Senior Mechanic. Answer this: ${question}`);
        const response = await result.response;
        res.send({ answer: response.text() });
    } catch (error) {
        console.error("AI Error:", error.message); // This tells us the EXACT error
        res.status(500).send({ answer: `MechBot Error: ${error.message}` });
    }
});

io.on('connection', (socket) => {
    socket.on('share_knowledge', (data) => io.emit('receive_knowledge', data));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Engine running on ${PORT}`));
