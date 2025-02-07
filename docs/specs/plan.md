# Spec Implementation Plan

## Project Environment Setup
- [x] Initialize the project with a TypeScript setup (package.json, tsconfig.json, etc.).
- [x] Install dependencies: express, dotenv, morgan, typescript, ts-node, @types/node, @types/express, and @types/morgan.

## REST API Server Implementation (src/server.ts)
- [x] Create an asynchronous REST API with Express.
- [x] Create a POST endpoint at /v1/chat/completions that:
  - Parses a JSON payload.
  - Checks for a boolean parameter `stream`.
  - If `stream` is false or not provided, returns a JSON response with the following mock data:
    ```json
    {
      "id": "chatcmpl-mock",
      "object": "chat.completion",
      "created": 1234567890,
      "choices": [
        {
          "index": 0,
          "message": { "role": "assistant", "content": "This is a mock response." },
          "finish_reason": "stop"
        }
      ],
      "usage": { "prompt_tokens": 5, "completion_tokens": 7, "total_tokens": 12 }
    }
    ```
  - If `stream` is true, initiates streaming:
    - Sets the header `Content-Type: text/event-stream`.
    - Uses asynchronous delays (e.g., `setTimeout`) and `res.write` to simulate the streaming response.
    - Logs the progress of each data chunk sent.

## LiteLLM Client Implementation (src/client.ts)
Below is a minimal Python client using **LiteLLM** to call your local mock `/v1/chat/completions` endpoint.  
It assumes:
1. You have **litellm** installed.
2. Your local server is already running on `http://localhost:3000`.
3. You set `OPENAI_API_KEY` to some placeholder (e.g., `"test"`) and point `OPENAI_API_BASE` to `http://localhost:3000/v1`.

---

### 1. Create `src/client/client.py` with the following content:

```python
import os
from litellm import completion

# Configure environment to point LiteLLM to the local mock server.
# "OPENAI_API_BASE" is recognized by LiteLLM to override the default OpenAI endpoint.
os.environ["OPENAI_API_KEY"] = "test"  # Placeholder
os.environ["OPENAI_API_BASE"] = "http://localhost:3000/v1"

def run_litellm_non_stream():
    """Calls local server in non-stream mode using LiteLLM."""
    try:
        response = completion(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello from a non-stream test"}],
            stream=False
        )
        print("Non-streaming response:", response)
    except Exception as e:
        print("Error in non-stream mode:", e)

def run_litellm_stream():
    """Calls local server in stream mode using LiteLLM."""
    try:
        response = completion(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello from a streaming test"}],
            stream=True
        )
        print("Streaming response:", response)
    except Exception as e:
        print("Error in streaming mode:", e)

if __name__ == "__main__":
    print("Running LiteLLM Client Non-Stream Mode:")
    run_litellm_non_stream()
    print("\nRunning LiteLLM Client Stream Mode:")
    run_litellm_stream()
```
---

Please review and let me know if you approve these changes or need any adjustments.

## Configuration Management and Logging
- [ ] Create a configuration module (e.g., src/config.ts) to load server configurations (port, log levels, etc.) from environment variables with default values.
- [x] Integrate logging (e.g., using morgan) to log incoming requests and streaming events.

## Documentation
- [ ] Update the readme.md file with:
  - Installation and configuration instructions.
  - Build and run instructions for the API server.
  - How to use the LiteLLM client.
  - Testing instructions (unit and integration tests).
