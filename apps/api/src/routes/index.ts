import { Router, Request, Response, NextFunction } from 'express';
import statsRouter from './stats';
import invoicesRouter from './invoices';
import analyticsRouter from './analytics';
import dashboardRouter from './dashboard';
import chatRouter from './chat';
import chatWithDataRouter from './chatWithData';
import exportRouter from './export';

const router = Router();

// API routes
router.use('/stats', statsRouter);
router.use('/invoices', invoicesRouter);
router.use('/analytics', analyticsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/export', exportRouter);
router.use('/chat-with-data', chatWithDataRouter);
router.use('/', chatRouter);

// API version info
router.get('/version', (req: Request, res: Response) => {
  res.json({
    api: 'v1',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Error handling for async route handlers
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Example of a protected route
router.get('/protected', (req: Request, res: Response) => {
  // Add your authentication logic here
  res.json({ message: 'Protected route' });
});

// 404 handler for /api/* routes
router.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

export default router;
