"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const extension_1 = require("./extension");
// Load environment variables from .env file if present
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware to parse JSON bodies with configurable limit
const jsonLimit = process.env.JSON_LIMIT || '5mb';
app.use(express_1.default.json({ limit: jsonLimit }));
// Logger middleware
app.use((0, morgan_1.default)('combined'));
// POST /v1/chat/completions endpoint implementation
app.post('/v1/chat/completions', async (req, res) => {
    const { model, stream } = req.body;
    // Remove vendor prefixes so that only the actual model name is used.
    // For instance, "openrouter/anthropic/claude-3.5-sonnet" becomes "claude-3.5-sonnet".
    req.body.model = model.split('/').pop();
    if (stream) {
        // Set headers for streaming.
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        try {
            // Call processChatRequest and expect an async iterator for streaming.
            const streamIterator = await (0, extension_1.processChatRequest)(req.body);
            for await (const chunk of streamIterator) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
                console.log(`Sent chunk with content: ${chunk.choices[0].delta.content}`);
            }
            res.write("data: [DONE]\n\n");
            res.end();
        }
        catch (error) {
            console.error("Streaming error:", error);
            return res.status(500).json({ error: "Streaming error" });
        }
    }
    else {
        try {
            // For non-streaming, await a full response.
            const fullResponse = await (0, extension_1.processChatRequest)(req.body);
            return res.json(fullResponse);
        }
        catch (error) {
            console.error("Non-streaming error:", error);
            return res.status(500).json({ error: "Error processing request" });
        }
    }
});
function startServer(port = 3000) {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
    return server;
}
exports.startServer = startServer;
// If running as a standalone Node process, start the server automatically.
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=server.js.map
