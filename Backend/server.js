require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const port = process.env.PORT || 5001; 
app.use(cors()); 
app.use(express.json()); 
if (!process.env.GEMINI_API_KEY) {
  throw new Error("gemini api key is not defined in the .env file");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 


app.post('/api/generate', async (req, res) => {
  console.log("Received request at /api/generate");

  try { 
    const { promptData } = req.body;
    if (!promptData || Object.keys(promptData).length === 0) {
      return res.status(400).json({ error: 'Prompt data is missing or empty.' });
    }
    const prompt = `
      You are an expert resume writer. Generate a professional and concise 'About' section for a resume.
      Use the following details provided in the JSON object below:
      
      Details: ${JSON.stringify(promptData)}

      Instructions:
      - The summary should be about 3-5 sentences long.
      - Write in a professional and confident tone.
      - Weave the skills and achievements into the narrative naturally.
      - Do not just list the details; create a compelling paragraph.
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();
    console.log(generatedText);
    res.json({ generatedText: generatedText });

  } catch (error) {
    console.error("Error in /api/generate:", error.message);
    res.status(500).json({ error: 'An internal server error occurred while generating content.' });
  }
});
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});