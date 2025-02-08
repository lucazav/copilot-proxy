### **2. Proposed Plan (to be recorded in `docs/specs/plan.md`)**

- [x] **Step 1: Whitelist Validation in `server.ts`**
  - **Task:** Modify `/v1/chat/completions` endpoint to check that `req.body.model` is one of the allowed models.
  - **Test:**
    - Send a request with a model not in the whitelist and expect an HTTP 400 error with a clear error message.
  - **Example Outline:**
    - Define an array of allowed models: `["gpt-4o", "gpt-4o-mini", "o1", "o1-mini", "claude-3.5-sonnet"]`.
    - If `req.body.model` is not in the array, return a 400 response with `{ error: "Model <model> not supported" }`.

- [ ] **Step 2: Branch Based on the `stream` Flag in `server.ts`**
  - **Task:** In the endpoint handler, branch logic for streaming vs. non-streaming requests.
  - **Test:**
    - For a streaming request (`stream: true`), verify that the server writes multiple HTTP chunks.
    - For a non-streaming request (`stream: false`), verify that the full JSON response is returned after the whole response is accumulated.
  - **Example Outline:**
    - If `stream` is true, call the asynchronous function (e.g., `processChatRequest`) and iterate over its yielded chunks, writing each with `res.write(...)`.
    - If `stream` is false, await the full result and then send it with `res.json(...)`.

- [ ] **Step 3: Implement `processChatRequest` in `extension.ts`**
  - **Task:** Create a new async function `processChatRequest` that:
    1. Receives a `ChatCompletionRequest`.
    2. Maps the request messages to the format required by `vscode.LanguageModelChatMessage` (direct mapping).
    3. Uses `vscode.lm.selectChatModels` to select the language model based on the provided `model` (which, by this point, is known to be allowed).
    4. Depending on the `stream` flag:
      - **Streaming:** Returns an async iterator that yields chunks mimicking a `ChatCompletionChunk`. Each yielded object should include the necessary properties (e.g., an `id`, `object`, `created`, `model`, and a `choices` array with a `delta` containing the fragment).
      - **Non-Streaming:** Accumulates fragments from the model response and then returns a full `ChatCompletionResponse` JSON object.
  - **Test:**
    - Test this function independently by invoking it with a mock `ChatCompletionRequest`.
    - For streaming, verify that iterating over the returned async iterator produces valid chunk objects.
    - For non-streaming, verify that the full response object is assembled correctly.
  - **Example Outline:**
    - Map messages: Iterate over `request.messages` and create an array using `vscode.LanguageModelChatMessage.User(message.content)`.
    - Select model using `vscode.lm.selectChatModels({ vendor: 'copilot', family: request.model })`.
    - For streaming:
      - Use an async generator function that yields objects like:
        - `{
              id: "chatcmpl-async-mock",
              object: "chat.completion.chunk",
              created: Date.now(),
              model: request.model,
              choices: [{
                delta: { content: fragment },
                index: 0,
                finish_reason: null
              }]
            }`
      - Yield for each fragment received.
    - For non-streaming:
      - Accumulate fragments into a string.
      - Return an object like:
        - `{
              id: "chatcmpl-full-mock",
              object: "chat.completion",
              created: Date.now(),
              choices: [{
                index: 0,
                message: { role: "assistant", content: fullResponse },
                finish_reason: "stop"
              }],
              usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
            }`.

- [ ] **Step 4: Integrate Logging and Error Handling**
  - **Task:** Add logging statements in both `server.ts` and `extension.ts` (especially in `processChatRequest`) to capture key events and possible errors.
  - **Test:**
    - Manually trigger both valid and error cases and examine the logs.

- [ ] **Step 5: Testing and Verification**
  - **Task:** Write or update unit/integration tests to ensure:
    1. The whitelist check properly rejects unsupported models.
    2. The branching on the `stream` flag correctly processes both streaming and non-streaming requests.
    3. The async generator in streaming mode yields correctly structured chunks.
    4. The full response in non-streaming mode is correctly assembled.
  - **Test:**
    - Run the tests to verify each isolated behavior.

- [ ] **Step 6: Update Documentation**
  - **Task:** Update the README and any relevant internal documentation with instructions on the new server–extension integration, the allowed models, the response handling, and how to run the tests.
  - **Test:**
    - Confirm that following the documentation allows a new developer to verify the functionality.
