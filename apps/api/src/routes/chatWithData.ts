
import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const r = Router();
r.post("/", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "query required" });
  try {
    const vanna_url = (process.env.VANNA_URL || "http://localhost:8000") + "/query";
    console.log('Calling Vanna:', vanna_url);
    const resp = await axios.post(vanna_url, { prompt: query, database_url: process.env.DATABASE_URL }, { timeout: 30000 });
    res.json(resp.data);
  } catch (e: any) {
    console.error('Chat error:', e.response?.data || e.message);
    const errorMsg = e.response?.data?.detail || e.message || String(e);
    res.status(500).json({ error: errorMsg });
  }
});
export default r;
