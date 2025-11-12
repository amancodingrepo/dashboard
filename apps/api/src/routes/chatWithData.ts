
import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const router = Router();
router.post("/", async (req, res) => {
  console.log('Chat with data endpoint hit:', req.body);
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "query required" });
  try {
    const vanna_url = (process.env.VANNA_API_BASE_URL || "http://localhost:8000") + "/generate-sql";
    console.log('Calling Vanna:', vanna_url);
    const resp = await axios.post(vanna_url, { question: query }, { timeout: 30000 });
    
    // Map Vanna response to frontend expected format
    const vannaData = resp.data;
    const response = {
      answer: vannaData.success ? 
        `I found ${vannaData.results?.length || 0} results for your query.` : 
        "I encountered an issue processing your request.",
      sql: vannaData.sql,
      results: vannaData.results || [],
      error: vannaData.success ? null : (vannaData.error || "Unknown error"),
      success: vannaData.success
    };
    
    res.json(response);
  } catch (e: any) {
    console.error('Chat error:', e.response?.data || e.message);
    const errorMsg = e.response?.data?.detail || e.response?.data?.error || e.message || String(e);
    res.status(500).json({ 
      error: errorMsg,
      answer: "Sorry, I encountered an error connecting to the AI service.",
      sql: null,
      results: [],
      success: false
    });
  }
});
export default router;
