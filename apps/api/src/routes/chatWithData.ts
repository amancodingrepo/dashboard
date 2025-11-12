
import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const router = Router();
router.post("/", async (req, res) => {
  console.log('Chat with data endpoint hit:', req.body);
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "query required" });
  
  // Check if Vanna service is configured
  const vanna_base_url = process.env.VANNA_API_BASE_URL;
  console.log('VANNA_API_BASE_URL:', vanna_base_url ? 'Set' : 'Not set');
  
  if (!vanna_base_url) {
    console.log('Vanna AI service not configured, returning error');
    return res.status(503).json({
      error: "Vanna AI service not configured. Please set VANNA_API_BASE_URL environment variable.",
      answer: "The AI service is not available. Please contact your administrator.",
      sql: null,
      results: [],
      success: false
    });
  }
  
  try {
    const vanna_url = vanna_base_url + "/generate-sql";
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
    console.error('Chat error details:', {
      message: e.message,
      code: e.code,
      response: e.response?.data,
      status: e.response?.status
    });
    
    let errorMsg = "Unknown error";
    let userMessage = "Sorry, I encountered an error connecting to the AI service.";
    
    if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
      errorMsg = `Cannot connect to Vanna AI service: ${e.message}`;
      userMessage = "The AI service is currently unavailable. Please try again later.";
    } else if (e.response?.status) {
      errorMsg = `Vanna AI service error (${e.response.status}): ${e.response?.data?.error || e.message}`;
      userMessage = "The AI service returned an error. Please try again.";
    } else {
      errorMsg = e.response?.data?.detail || e.response?.data?.error || e.message || String(e);
    }
    
    res.status(500).json({ 
      error: errorMsg,
      answer: userMessage,
      sql: null,
      results: [],
      success: false
    });
  }
});
export default router;
