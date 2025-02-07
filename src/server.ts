import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Load environment variables from .env file if present
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Logger middleware
app.use(morgan('combined'));

// POST /v1/chat/completions endpoint implementation
app.post('/v1/chat/completions', async (req: Request, res: Response) => {
  const stream = req.body.stream;

  if (stream) {
    // Initiate streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let count = 0;
    const maxChunks = 3;

    const sendChunk = () => {
      count++;
      // Prepare a JSON object for this chunk
      const chunkData = { message: `This is chunk ${count}` };
      // Write the chunk in the event stream format
      res.write(`data: ${JSON.stringify(chunkData)}\n\n`);

      console.log(`Sent chunk ${count}`);

      if (count < maxChunks) {
        // Schedule the next chunk
        setTimeout(sendChunk, 1000); // Delay 1 second between chunks
      } else {
        // Finalize the stream
        res.write(`data: [DONE]\n\n`);
        res.end();
      }
    };

    // Start the streaming process after an initial delay
    setTimeout(sendChunk, 1000);
  } else {
    // Non-streaming response: return static JSON mock data
    const mockResponse = {
      id: "chatcmpl-mock",
      object: "chat.completion",
      created: 1234567890,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "This is a mock response." },
          finish_reason: "stop"
        }
      ],
      usage: { prompt_tokens: 5, completion_tokens: 7, total_tokens: 12 }
    };
    res.json(mockResponse);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
