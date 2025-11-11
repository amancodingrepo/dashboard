"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Add your routes here
router.get('/example', (req, res) => {
    res.json({ message: 'Example route' });
});
exports.default = router;
//# sourceMappingURL=routes.js.map