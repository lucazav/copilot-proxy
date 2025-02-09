import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import {ChatCompletionRequest, ChatCompletionChunk, ChatCompletionChunkDelta, ChatCompletionResponse} from './types';
import { processChatRequest } from './extension';

// Load environment variables from .env file if present
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Logger middleware
app.use(morgan('combined'));

// POST /v1/chat/completions endpoint implementation
app.post<{}, {}, ChatCompletionRequest>('/v1/chat/completions', async (req, res) => {
  const { model, stream } = req.body;

  // Whitelist validation: Define allowed models.
  // const allowedModels = ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini", "claude-3.5-sonnet"];
  // if (!allowedModels.includes(model)) {
  //   console.log(`Model ${model} is not supported.`);
  //   return res.status(400).json({ error: `Model ${model} not supported` });
  // }

  console.log(JSON.stringify(req.body));

  if (stream) {
    // Set headers for streaming.
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // Call processChatRequest and expect an async iterator for streaming.
      const streamIterator = await processChatRequest(req.body) as AsyncIterable<ChatCompletionChunk>;
      for await (const chunk of streamIterator) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        console.log(`Sent chunk with content: ${chunk.choices[0].delta.content}`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Streaming error:", error);
      return res.status(500).json({ error: "Streaming error" });
    }
  } else {
    try {
      // For non-streaming, await a full response.
      const fullResponse = await processChatRequest(req.body) as ChatCompletionResponse;
      return res.json(fullResponse);
    } catch (error) {
      console.error("Non-streaming error:", error);
      return res.status(500).json({ error: "Error processing request" });
    }
  }
});

export function startServer() {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  return server;
}

// If running as a standalone Node process, start the server automatically.
if (require.main === module) {
  startServer();
}
