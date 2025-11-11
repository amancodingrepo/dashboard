"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../lib/db"));
const r = (0, express_1.Router)();
r.get("/", async (_req, res) => {
    const rows = await db_1.default.invoice.findMany({ take: 20, include: { vendor: true, customer: true } });
    res.json({ data: rows });
});
exports.default = r;
//# sourceMappingURL=invoices.js.map