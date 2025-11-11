import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/db';

const router = Router();

// Load local JSON data
router.get('/', async (_req, res) => {
  try {
    const filePath = path.join(__dirname, '../../Analytics_Test_Data.json');
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(jsonData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load analytics data' });
  }
});

export default router;
