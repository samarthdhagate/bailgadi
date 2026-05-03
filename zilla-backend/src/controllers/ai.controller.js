const { GoogleGenerativeAI } = require('@google/generative-ai');
const { env } = require('../config/env');

let cachedModel = null;

function getModel() {
  if (!env.GEMINI_API_KEY) return null;
  if (!cachedModel) {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    cachedModel = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction:
        'You are Zilla AI, a premium assistant for Zilla, a SaaS booking platform. You help users manage appointments and navigate the platform. Keep responses concise and professional.',
    });
  }
  return cachedModel;
}

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const user = req.user;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message is required.' },
      });
    }

    if (!env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: { message: 'AI API Key is not configured.' },
      });
    }

    const model = getModel();

    const result = await model.generateContent([
      {
        text: `User ID: ${user?.user_id ?? 'unknown'}, Role: ${user?.role ?? 'Guest'}. Message: ${message}`,
      },
    ]);

    const responseText = result.response.text();

    res.json({
      success: true,
      data: {
        content: responseText,
        role: 'bot',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Gemini AI Error:', err);
    next(err);
  }
};

module.exports = {
  chat,
};
