"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_1 = __importDefault(require("./stats"));
const router = (0, express_1.Router)();
// API routes
router.use('/stats', stats_1.default);
// API version info
router.get('/version', (req, res) => {
    res.json({
        api: 'v1',
        status: 'active',
        timestamp: new Date().toISOString()
    });
});
// Error handling for async route handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// Example of a protected route
router.get('/protected', (req, res) => {
    // Add your authentication logic here
    res.json({ message: 'Protected route' });
});
// 404 handler for /api/* routes
router.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        method: req.method
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map