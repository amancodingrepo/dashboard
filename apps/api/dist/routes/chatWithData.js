"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const r = (0, express_1.Router)();
r.post("/", async (req, res) => {
    var _a, _b, _c;
    const { query } = req.body;
    if (!query)
        return res.status(400).json({ error: "query required" });
    try {
        const vanna_url = (process.env.VANNA_URL || "http://localhost:8000") + "/query";
        console.log('Calling Vanna:', vanna_url);
        const resp = await axios_1.default.post(vanna_url, { prompt: query, database_url: process.env.DATABASE_URL }, { timeout: 30000 });
        res.json(resp.data);
    }
    catch (e) {
        console.error('Chat error:', ((_a = e.response) === null || _a === void 0 ? void 0 : _a.data) || e.message);
        const errorMsg = ((_c = (_b = e.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.detail) || e.message || String(e);
        res.status(500).json({ error: errorMsg });
    }
});
exports.default = r;
//# sourceMappingURL=chatWithData.js.map