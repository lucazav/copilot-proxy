import * as vscode from 'vscode';
import { startServer } from './server';

let serverInstance: ReturnType<typeof startServer>;

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "my-extension" is now active!');

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
    console.log('Express server has been stopped on deactivation.');
  }
}
