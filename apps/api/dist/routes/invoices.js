"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Load local JSON data
router.get('/', async (_req, res) => {
    try {
        const filePath = path_1.default.join(__dirname, '../../Analytics_Test_Data.json');
        const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
        res.json(jsonData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load analytics data' });
    }
});
exports.default = router;
//# sourceMappingURL=invoices.js.map