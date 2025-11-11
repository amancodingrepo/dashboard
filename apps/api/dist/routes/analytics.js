"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// Using shared Prisma client instance from lib/prisma
// Get analytics summary from JSON file
router.get('/summary', async (req, res) => {
    try {
        // Path to Analytics_Test_Data.json in apps/api/
        const filePath = path_1.default.join(__dirname, '../../Analytics_Test_Data.json');
        // Check if file exists
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({
                error: 'Analytics data file not found',
                message: 'Analytics_Test_Data.json does not exist in apps/api/'
            });
        }
        // Read and parse JSON file
        const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
        let documents;
        try {
            documents = JSON.parse(fileContent);
        }
        catch (parseError) {
            return res.status(500).json({
                error: 'Failed to parse analytics data',
                message: 'Analytics_Test_Data.json contains invalid JSON',
                details: parseError.message
            });
        }
        // Validate that documents is an array
        if (!Array.isArray(documents)) {
            return res.status(500).json({
                error: 'Invalid data format',
                message: 'Analytics_Test_Data.json must contain an array of documents'
            });
        }
        // Compute summary statistics
        let totalFiles = documents.length;
        let validatedFiles = 0;
        let totalSizeBytes = 0;
        let confidenceScores = [];
        documents.forEach((doc) => {
            var _a, _b, _c, _d, _e;
            // Count validated files
            if (doc.isValidatedByHuman === true) {
                validatedFiles++;
            }
            // Sum file sizes (handle $numberLong format)
            if (doc.fileSize) {
                if (typeof doc.fileSize === 'number') {
                    totalSizeBytes += doc.fileSize;
                }
                else if (doc.fileSize.$numberLong) {
                    totalSizeBytes += parseInt(doc.fileSize.$numberLong, 10) || 0;
                }
            }
            // Extract confidence scores from invoice data
            try {
                const invoiceIdConfidence = (_e = (_d = (_c = (_b = (_a = doc.extractedData) === null || _a === void 0 ? void 0 : _a.llmData) === null || _b === void 0 ? void 0 : _b.invoice) === null || _c === void 0 ? void 0 : _c.value) === null || _d === void 0 ? void 0 : _d.invoiceId) === null || _e === void 0 ? void 0 : _e.confidence;
                if (invoiceIdConfidence) {
                    const confidence = parseFloat(invoiceIdConfidence);
                    if (!isNaN(confidence)) {
                        confidenceScores.push(confidence);
                    }
                }
            }
            catch (e) {
                // Skip documents with missing or malformed confidence data
            }
        });
        // Calculate averages
        const totalSizeKB = parseFloat((totalSizeBytes / 1024).toFixed(2));
        const avgConfidence = confidenceScores.length > 0
            ? parseFloat((confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length).toFixed(2))
            : 0;
        const unvalidatedFiles = totalFiles - validatedFiles;
        // Return summary
        res.json({
            totalFiles,
            validatedFiles,
            unvalidatedFiles,
            totalSizeKB,
            avgConfidence
        });
    }
    catch (error) {
        console.error('Failed to fetch analytics summary:', error);
        res.status(500).json({
            error: 'Failed to fetch analytics data',
            message: error.message || 'An unexpected error occurred'
        });
    }
});
// Get documents for analytics
router.get('/documents', async (req, res) => {
    try {
        // Support basic filtering
        const { status, template, limit = 50 } = req.query;
        const filterOptions = {};
        if (status === 'validated') {
            filterOptions.isValidatedByHuman = true;
        }
        else if (status === 'unvalidated') {
            filterOptions.isValidatedByHuman = false;
        }
        if (template) {
            filterOptions.templateName = template;
        }
        const documents = await prisma_1.prisma.document.findMany({
            where: filterOptions,
            take: Number(limit),
            include: {
                invoice: {
                    include: {
                        vendor: true,
                        customer: true,
                    },
                },
                lineItems: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
        res.json(documents);
    }
    catch (error) {
        console.error('Failed to fetch documents for analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
});
// Fallback to serve sample JSON data if DB is not available
router.get('/', async (req, res) => {
    try {
        // First try to get data from database
        const analytics = await prisma_1.prisma.analytics.findFirst({
            include: { documents: true },
        });
        if (analytics) {
            return res.json(analytics);
        }
        // Fallback to sample data
        const filePath = path_1.default.join(__dirname, '../../Analytics_Test_Data.json');
        const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
        res.json(jsonData);
    }
    catch (error) {
        console.error('Failed to load analytics data:', error);
        res.status(500).json({ error: 'Failed to load analytics data' });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map