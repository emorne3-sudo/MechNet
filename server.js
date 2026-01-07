const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

const server = http.createServer(app);
const io = new Server(server);

// AI CONFIGURATION
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_KEY_HERE");

app.post("/ask-mechbot", async (req, res) => {
    try {
        const { question } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are MechBot, an industrial mechanic expert. Question: ${question}`;
        const result = await model.generateContent(prompt);
        res.send({ answer: result.response.text() });
    } catch (e) {
        res.status(500).send({ answer: "MechBot is busy on another job. Try again." });
    }
});

io.on('connection', (socket) => {
    socket.on('share_knowledge', (data) => {
        io.emit('receive_knowledge', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("MechNet Engine Running..."));
