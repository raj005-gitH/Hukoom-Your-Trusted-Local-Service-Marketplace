const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatMessage = require("../models/ChatMessage");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are "Hukoom AI" — a smart, friendly, and professional service assistant for the Hukoom platform. 
Hukoom connects users with local service providers (called "Heroes") for everyday needs like plumbing, electrical work, cleaning, carpentry, painting, mechanics, and more.

Your job is to:
- Help users find the right service for their problem
- Suggest what type of professional they need
- Give helpful tips about home/office maintenance
- Provide estimated cost ranges for common services in India (in ₹)
- Be conversational, warm, and helpful
- Keep responses concise but informative (2-4 paragraphs max)
- Use emojis sparingly but effectively

You should NOT:
- Make actual bookings (just guide users on how to post a query on the platform)
- Provide medical, legal, or financial advice
- Discuss topics unrelated to home/office services

If a user asks about something outside your scope, politely redirect them to the relevant services.
Always remind users they can post a service request on Hukoom to get help from verified local Heroes.`;

// POST /api/ai — Send a message to Gemini and get a reply
router.post("/ai", async (req, res) => {
  try {
    const { prompt, userId, userName, userRole, sessionId } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const safeUserId = userId || "anonymous";
    const safeUserName = userName || "Guest";
    const safeRole = userRole || "user";
    const safeSessionId = sessionId || `session_${Date.now()}`;

    // Save the user's message to DB
    await ChatMessage.create({
      userId: safeUserId,
      userName: safeUserName,
      role: safeRole,
      sender: "user",
      text: prompt.trim(),
      sessionId: safeSessionId,
    });

    // Fetch recent chat history for context (last 10 messages in this session)
    const history = await ChatMessage.find({ sessionId: safeSessionId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // Build conversation context for Gemini
    const conversationContext = history
      .reverse()
      .map((msg) => `${msg.sender === "user" ? "User" : "Hukoom AI"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation so far:\n${conversationContext}\n\nUser: ${prompt.trim()}\nHukoom AI:`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(fullPrompt);
    const reply = result.response.text();

    // Save the AI's reply to DB
    await ChatMessage.create({
      userId: safeUserId,
      userName: safeUserName,
      role: safeRole,
      sender: "ai",
      text: reply,
      sessionId: safeSessionId,
    });

    res.json({ reply });
  } catch (error) {
    console.log("Error in AI route:", error);
    res.status(500).json({
      message: "AI service error",
      reply: "Sorry, I'm having trouble connecting right now. Please try again in a moment. 🔄",
    });
  }
});

// GET /api/ai/history/:userId — Get chat history for a user
router.get("/ai/history/:userId", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.log("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

// GET /api/ai/session/:sessionId — Get messages for a specific session
router.get("/ai/session/:sessionId", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ sessionId: req.params.sessionId })
      .sort({ timestamp: 1 })
      .lean();

    res.json({ messages });
  } catch (error) {
    console.log("Error fetching session:", error);
    res.status(500).json({ message: "Error fetching session" });
  }
});

module.exports = router;
