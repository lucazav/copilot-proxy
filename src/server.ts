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

  console.log(req.body);

  if (stream) {
    // Initiate streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const chunks = ["This is a", " mock", " response."];
    let index = 0;

    const sendChunk = () => {
      const baseChunk = {
        id: "chatcmpl-mock",
        object: "chat.completion.chunk",
        created: 1234567890,
        model: "gpt-3.5-turbo",
        choices: [
          {
            delta: {} as any,
            index: 0,
            finish_reason: '',
          }
        ]
      };

      // For the first chunk, include the role.
      if (index === 0) {
        baseChunk.choices[0].delta.role = "assistant";
      }
      // Append the content piece.
      baseChunk.choices[0].delta.content = chunks[index];

      // On the final chunk, specify the finish reason.
      if (index === chunks.length - 1) {
        baseChunk.choices[0].finish_reason = "stop";
      }

      // Send the chunk in event stream format.
      res.write(`data: ${JSON.stringify(baseChunk)}\n\n`);
      console.log(`Sent chunk ${index + 1}`);

      index++;
      if (index < chunks.length) {
        // Schedule the next chunk after 1 second.
        setTimeout(sendChunk, 1000);
      } else {
        // Finalize the stream.
        res.write("data: [DONE]\n\n");
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
