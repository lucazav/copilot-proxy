import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel;
import { startServer } from './server';
import {ChatCompletionChunk, ChatCompletionRequest, ChatCompletionResponse} from './types';

let serverInstance: ReturnType<typeof startServer> | undefined;

function configurePort() {
  const config = vscode.workspace.getConfiguration("copilotProxy");
  const currentPort = config.get<number>("port", 3000);
  vscode.window.showInputBox({
    prompt: "Enter the port for the Express server:",
    placeHolder: "e.g., 3000",
    value: String(currentPort),
    validateInput: (value: string): string | undefined => {
      const port = Number(value);
      if (isNaN(port) || port <= 0) {
        return "Please enter a valid positive integer for the port.";
      }
      return undefined;
    }
  }).then(newPortStr => {
    if (newPortStr !== undefined) {
      const newPort = Number(newPortStr);
      config.update("port", newPort, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`Port updated to ${newPort}. Restart the server if it's running.`);
    }
  });
}


export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Copilot Proxy Log');
  outputChannel.show();
  context.subscriptions.push(outputChannel);
  outputChannel.appendLine('Extension "Copilot Proxy" is now active!');

  // Register command to start the Express server.
  context.subscriptions.push(
    vscode.commands.registerCommand('Copilot Proxy - Start Server', () => {
      if (!serverInstance) {
        const configPort = vscode.workspace.getConfiguration("copilotProxy").get("port", 3000);
        serverInstance = startServer(configPort);
        vscode.window.showInformationMessage(`Express server started on port ${configPort}.`);
      } else {
        vscode.window.showInformationMessage('Express server is already running.');
      }
    })
  );

  // Register command to stop the Express server.
  context.subscriptions.push(
    vscode.commands.registerCommand('Copilot Proxy - Stop Server', () => {
      if (serverInstance) {
        serverInstance.close();
        serverInstance = undefined;
        vscode.window.showInformationMessage('Express server stopped.');
      } else {
        vscode.window.showInformationMessage('No Express server is running.');
      }
    })
  );

  // Register command to configure the port.
  context.subscriptions.push(
    vscode.commands.registerCommand('Copilot Proxy: Configure Port', () => {
      configurePort();
    })
  );

  // Register a disposable to stop the server when the extension is deactivated.
  context.subscriptions.push({
    dispose: () => {
      if (serverInstance) {
        serverInstance.close();
        outputChannel.appendLine('Express server has been stopped.');
      }
    }
  });
}

export function deactivate() {
  if (serverInstance) {
    serverInstance.close();
    serverInstance = undefined;
    outputChannel.appendLine('Express server has been stopped on deactivation.');
  }
}

export async function processChatRequest(request: ChatCompletionRequest): Promise<AsyncIterable<ChatCompletionChunk> | ChatCompletionResponse> {
  // Map request messages to vscode.LanguageModelChatMessage format.
  // AI!: adjust the mapping: use .User() for user messages (role=="user" make case-insensetive check!) and .Assistant() for all others; use the max. 30 chars of the newest/latest user message for preview and add ... before
  const chatMessages = request.messages.map((message) =>
    vscode.LanguageModelChatMessage.User(message.content)
  );
  const lastMessage = request.messages[request.messages.length - 1]?.content || '';
  const preview = lastMessage.length > 30 ? lastMessage.slice(-30) : lastMessage;
  outputChannel.appendLine(`Request received. Model: ${request.model}. Preview: ${preview}`);

  const [selectedModel] = await vscode.lm.selectChatModels({
    vendor: "copilot",
    family: request.model,
  });
  if (!selectedModel) {
    outputChannel.appendLine(`ERROR: No language model available for model: ${request.model}`);
    throw new Error(`No language model available for model: ${request.model}`);
  }

  if (request.stream) {
    // Streaming mode: call the real backend and yield response chunks.
    return (async function* () {
      try {
        const cancellationSource = new vscode.CancellationTokenSource();
        const chatResponse = await selectedModel.sendRequest(
          chatMessages,
          {},
          cancellationSource.token
        );
        let firstChunk = true;
        let chunkIndex = 0;
        // Iterate over the response fragments from the real backend.
        for await (const fragment of chatResponse.text) {
          const chunk: ChatCompletionChunk = {
            id: `chatcmpl-stream-${chunkIndex}`,
            object: "chat.completion.chunk",
            created: Date.now(),
            model: request.model,
            choices: [
              {
                delta: {
                  ...(firstChunk ? { role: "assistant" } : {}),
                  content: fragment,
                },
                index: 0,
                finish_reason: "",
              },
            ],
          };
          firstChunk = false;
          chunkIndex++;
          yield chunk;
        }
        // After finishing the iteration, yield a final chunk to indicate completion.
        const finalChunk: ChatCompletionChunk = {
          id: `chatcmpl-stream-final`,
          object: "chat.completion.chunk",
          created: Date.now(),
          model: request.model,
          choices: [
            {
              delta: { content: "" },
              index: 0,
              finish_reason: "stop",
            },
          ],
        };
        yield finalChunk;
      } catch (error) {
        outputChannel.appendLine("ERROR: Error in streaming mode: " + JSON.stringify(error));
        throw error;
      }
    })();
  } else {
    // Non-streaming mode: call the real backend and accumulate the full response.
    try {
      const cancellationSource = new vscode.CancellationTokenSource();
      const chatResponse = await selectedModel.sendRequest(
        chatMessages,
        {},
        cancellationSource.token
      );
      let fullContent = "";
      for await (const fragment of chatResponse.text) {
        fullContent += fragment;
      }
      const response: ChatCompletionResponse = {
        id: "chatcmpl-nonstream",
        object: "chat.completion",
        created: Date.now(),
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: fullContent },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: fullContent.length,
          total_tokens: fullContent.length,
        },
      };
      return response;
    } catch (error) {
      outputChannel.appendLine("ERROR: Error in non-streaming mode: " + JSON.stringify(error));
      throw error;
    }
  }
}
