const cohere = require("../utils/cohereClient");
const User = require("../models/User");

const getDiagnosis = async (req, res) => {
  try {
    const { symptoms } = req.body;
    const id = req?.user?.id;
    const user = await User.findById(id).select("gender dob");
    const { gender, dob } = user;

    const systemInstruction = `
You are Homedoc — a warm, helpful, and quick-witted AI health assistant.

Response rules:
- The user may provide one or multiple symptoms.
- Always group the output into clear sections:
  <h3>Possible diseases or causes</h3>
  <ul><li>...</li></ul>

  <h3>What may help</h3>
  <ul><li>...</li></ul>

  <h3>When to seek medical attention</h3>
  <ul><li>...</li></ul> 
- Use plain, supportive language.
- Always consider all symptoms together, not separately.
- Never use raw numbers or hyphens for lists — only HTML <ul> or <ol>.
- Stay strictly health-related. If input is unrelated, just say "Invalid input"
- Never return anything related to a follow up
`.trim();

    const messages = [
      `System: ${systemInstruction}`,
      `User: Symptoms: ${JSON.stringify(
        symptoms
      )}, Gender: ${gender}, Year of birth: ${dob}`,
      "AI:",
    ];

    // Step 3: Call Cohere
    const response = await cohere.post("/generate", {
      model: "command",
      prompt: messages.join("\n"),
      max_tokens: 400,
      temperature: 0.6,
      stop_sequences: ["User:", "AI:"],
    });

    const reply = response.data.generations[0].text.trim();

    // Step 4: Return result
    return res.json({
      status: "success",
      diagnosis: reply,
    });
  } catch (err) {
    console.error("AI Error:", err?.response?.data || err.message);
    return res.status(500).json({
      status: "error",
      error: "AI failed to respond",
    });
  }
};

module.exports = { getDiagnosis };

module.exports = getDiagnosis;
