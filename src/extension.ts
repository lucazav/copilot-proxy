import * as vscode from 'vscode';
import { startServer } from './server';

let serverInstance: ReturnType<typeof startServer>;

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "my-extension" is now active!');
  // Start the Express server when the extension activates.
  serverInstance = startServer();

  // Register a disposable to stop the server when the extension is deactivated.
  context.subscriptions.push({
    dispose: () => {
      if (serverInstance) {
        serverInstance.close();
        console.log('Express server has been stopped.');
      }
    }
  });

  // Register the "copilot-proxy" command.
  context.subscriptions.push(
    vscode.commands.registerCommand('my-extension.copilot-proxy', () => {
      vscode.window.showInformationMessage('Hello World from My Extension!');
    })
  );
}

export function deactivate() {
  if (serverInstance) {
    serverInstance.close();
    console.log('Express server has been stopped on deactivation.');
  }
}
