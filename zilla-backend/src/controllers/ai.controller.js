const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Controller for Zilla Assistant.
 * Uses Google Gemini API for real-time intelligence.
 */

// Initialize Gemini with the API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are Zilla AI, a premium assistant for Zilla, a SaaS booking platform. You help users (organisers and customers) manage appointments, schedule meetings, and navigate the platform. Your tone is professional, efficient, and friendly. Keep responses concise and focused on productivity. If a user asks about their schedule, remind them they can see it in the 'Upcoming Appointments' section on their dashboard."
});

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const user = req.user;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message is required.' }
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: { message: 'AI API Key is not configured.' }
      });
    }

    // Generate content using Gemini
    const result = await model.generateContent([
      { text: `User Name: ${user.name || 'User'}, User Role: ${user.role || 'Guest'}. Message: ${message}` }
    ]);

    const responseText = result.response.text();

    res.json({
      success: true,
      data: {
        content: responseText,
        role: 'bot',
        timestamp: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('Gemini AI Error:', err);
    next(err);
  }
};

module.exports = {
  chat
};
