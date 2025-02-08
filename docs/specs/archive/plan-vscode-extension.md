I am in the Analysis Workflow

Plan for Integrating Express Server into the VS Code Extension
---------------------------------------------------------------

Step 1: Update package.json
---------------------------
- Add the following extension metadata:
  - "engines": { "vscode": "^1.70.0" }
  - "activationEvents": [ "onCommand:my-extension.copilot-proxy" ]
  - "contributes": { 
        "commands": [
            {
              "command": "my-extension.copilot-proxy",
              "title": "Hello World"
            }
        ]
    }
- Update "main" to point to "./out/extension.js"
- Adjust build and test scripts if necessary

Step 2: Update tsconfig.json
----------------------------
- Change "target" to "ES2021"
- Set "module" to "commonjs"
- Set "rootDir" to "src"
- Change "outDir" to "out" (to match VS Code extension requirements)
- Enable "sourceMap": true
- Exclude "node_modules" and ".vscode-test"

Step 3: Modify src/server.ts
----------------------------
- Refactor the server startup by exporting a startup function instead of immediately calling app.listen.
- Modify the code as follows:

  export function startServer() {
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    return server;
  }

  // If running as a standalone process, start the server automatically.
  if (require.main === module) {
    startServer();
  }

Step 4: Create src/extension.ts
-------------------------------
- Create a new file "src/extension.ts" with the following content:

  import * as vscode from 'vscode';
  import { startServer } from './server';

  let serverInstance: ReturnType<typeof startServer>;

  export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "my-extension" is now active!');
    // Start the Express server on activation
    serverInstance = startServer();

    // Dispose the server on extension deactivation
    context.subscriptions.push({
      dispose: () => {
        if (serverInstance) {
          serverInstance.close();
          console.log('Express server has been stopped.');
        }
      }
    });

    // Register the "copilot-proxy" command
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

Step 5: Create .vscode/launch.json
---------------------------------
- Create a new file ".vscode/launch.json" with the following content:

  {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Launch Extension",
        "type": "extensionHost",
        "request": "launch",
        "runtimeExecutable": "${execPath}",
        "args": [
          "--extensionDevelopmentPath=${workspaceFolder}"
        ],
        "outFiles": [
          "${workspaceFolder}/out/**/*.js"
        ],
        "preLaunchTask": "npm: compile"
      }
    ]
  }

Step 6 (Optional): Test Setup
----------------------------
- Optionally, set up a test suite using vscode-test and Mocha.
- Create a folder "test/" containing test files such as "extension.test.ts" and "runTest.ts".
- Update package.json with test scripts:
  - "test": "npm run compile && npm run test:extension"
  - "test:extension": "node ./out/test/runTest.js"

Summary:
----------
This plan integrates the Express server into the VS Code extension lifecycle by:
- Refactoring the server startup into an exported function.
- Creating an extension entry point that starts and stops the Express server using the activate and deactivate methods.
- Updating configuration files (package.json, tsconfig.json, .vscode/launch.json) to support extension development.
- Optionally, adding a test suite to validate extension functionality.

Follow these steps to ensure that:
- The VS Code extension loads correctly.
- The Express server starts when the extension is activated.
- The "my-extension.copilot-proxy" command displays the expected message.
- The server is gracefully stopped on extension deactivation.
