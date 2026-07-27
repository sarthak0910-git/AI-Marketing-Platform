const { generateAIContent } = require("../services/aiService");

const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;

    const content = await generateAIContent(prompt);

    res.json({
      success: true,
      content,
    });
  } catch (error) {
  console.error("========== GEMINI ERROR ==========");
  console.error(error);
  console.error("Message:", error.message);
  console.error("Stack:", error.stack);

  res.status(500).json({
    success: false,
    message: error.message,
  });
}
};

module.exports = { generateContent };
