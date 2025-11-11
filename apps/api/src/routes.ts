import { Router } from 'express';

const router = Router();

// Add your routes here
router.get('/example', (req, res) => {
  res.json({ message: 'Example route' });
});

export default router;
