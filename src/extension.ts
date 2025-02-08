import * as vscode from 'vscode';
import { startServer } from './server';
import {ChatCompletionChunk, ChatCompletionRequest, ChatCompletionResponse} from './types';

let serverInstance: ReturnType<typeof startServer> | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "my-extension" is now active!');

  // Register command to start the Express server.
  context.subscriptions.push(
    vscode.commands.registerCommand('Copilot Proxy - Start Server', () => {
      if (!serverInstance) {
        serverInstance = startServer();
        vscode.window.showInformationMessage('Express server started.');
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

  // Register a disposable to stop the server when the extension is deactivated.
  context.subscriptions.push({
    dispose: () => {
      if (serverInstance) {
        serverInstance.close();
        console.log('Express server has been stopped.');
      }
    }
  });
}

export function deactivate() {
  if (serverInstance) {
    serverInstance.close();
    serverInstance = undefined;
    console.log('Express server has been stopped on deactivation.');
  }
}

export async function processChatRequest(request: ChatCompletionRequest): Promise<AsyncIterable<ChatCompletionChunk> | ChatCompletionResponse> {
  if (request.stream) {
    // Async generator for streaming response.
    return (async function* () {
      const chunks = ["This is a", " mock", " response."];
      for (let i = 0; i < chunks.length; i++) {
        yield {
          id: "chatcmpl-mock-stream",
          object: "chat.completion.chunk",
          created: Date.now(),
          model: request.model,
          choices: [{
            delta: {
              ...(i === 0 ? { role: "assistant" } : {}),
              content: chunks[i],
            },
            index: 0,
            finish_reason: i === chunks.length - 1 ? "stop" : "",
          }]
        };
      }
    })();
  } else {
    return {
      id: "chatcmpl-mock-nonstream",
      object: "chat.completion",
      created: Date.now(),
      choices: [{
        index: 0,
        message: { role: "assistant", content: "This is a mock response." },
        finish_reason: "stop"
      }],
      usage: { prompt_tokens: 5, completion_tokens: 7, total_tokens: 12 }
    };
  }
}
