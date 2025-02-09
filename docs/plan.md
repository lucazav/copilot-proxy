# Implementation Plan: Configure Express Server Port

## Overview
This plan outlines the steps to add a minimal settings UI for the copilot-proxy extension, allowing users to configure and persist the port used by the Express server. The port value is stored in the VS Code configuration (`copilotProxy.port`) and is used when starting the server.

## Step 1: Update Server Initialization
- **File:** `src/server.ts`
- **Objective:**  
  Modify the `startServer` function to accept an optional `port` parameter (default: 3000) and use it with `app.listen()`.

- **Code Changes:**

```diff
-const port = process.env.PORT || 3000;
-export function startServer() {
-  const server = app.listen(port, () => {
-    console.log(`Server is running on port ${port}`);
-  });
-  return server;
-}
+export function startServer(port: number = 3000) {
+  const server = app.listen(port, () => {
+    console.log(`Server is running on port ${port}`);
+  });
+  return server;
+}
```

- **Test Steps:**  
  1. **Manual Test:** Call `startServer(5000)` and verify the console logs "Server is running on port 5000".  
  2. **Integration Test:** Use a network tool (e.g., `netstat`) to confirm the server binds to the specified port.

## Step 2: Modify the Start Server Command
- **File:** `src/extension.ts`
- **Objective:**  
  Update the "Copilot Proxy - Start Server" command to read the port from the VS Code configuration (`copilotProxy.port`) and pass that value to `startServer()`.

- **Code Changes:**

```diff
-  vscode.commands.registerCommand('Copilot Proxy - Start Server', () => {
-      if (!serverInstance) {
-        serverInstance = startServer();
-        vscode.window.showInformationMessage('Express server started.');
-      } else {
-        vscode.window.showInformationMessage('Express server is already running.');
-      }
-  })
+  vscode.commands.registerCommand('Copilot Proxy - Start Server', () => {
+      if (!serverInstance) {
+        const configPort = vscode.workspace.getConfiguration("copilotProxy").get("port", 3000);
+        serverInstance = startServer(configPort);
+        vscode.window.showInformationMessage(`Express server started on port ${configPort}.`);
+      } else {
+        vscode.window.showInformationMessage('Express server is already running.');
+      }
+  });
```

- **Test Steps:**  
  1. **Command Test:** Run “Copilot Proxy - Start Server” from the VS Code Command Palette and verify the correct port is used.  
  2. **Log Verification:** Confirm in the server logs that the server starts on the port from the configuration.

## Step 3: Add the Minimal Settings GUI
- **File:** `src/extension.ts`
- **Objective:**  
  Create a function `configurePort()` that uses `vscode.window.showInputBox` to prompt the user for a new port:
  - Display the current port as the default value.
  - Validate that the input is a positive integer.
  - On confirmation, update the configuration persistently using `config.update()`.

- **Code Addition:**

```typescript
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
```

- **Test Steps:**  
  1. **Direct Invocation:** Call `configurePort()` and verify the input box shows the current port.  
  2. **Validation Check:** Test entering invalid values (e.g., negative numbers or non-numeric input) and observe the validation message.  
  3. **Persistence Check:** Confirm that after a valid update, the new port is saved in the configuration.

## Step 4: Register the "Configure Port" Command
- **File:** `src/extension.ts`
- **Objective:**  
  Register a new command (`Copilot Proxy: Configure Port`) within the `activate()` function to invoke `configurePort()`.

- **Code Addition:**

```typescript
// Register command to configure the port.
context.subscriptions.push(
  vscode.commands.registerCommand('Copilot Proxy: Configure Port', () => {
    configurePort();
  })
);
```

- **Test Steps:**  
  1. **Command Test:** Run “Copilot Proxy: Configure Port” from the Command Palette and check that the input box appears with the current port pre-filled.  
  2. **Persistence Test:** After updating via the command, verify that the configuration reflects the new port.

## Step 5: Update package.json to Contribute the New Configuration
- **File:** `package.json`
- **Objective:**  
  Add a configuration contribution to make the `copilotProxy.port` setting visible in the VS Code Settings UI.

- **Code Addition:**

```json
"contributes": {
  "configuration": {
    "type": "object",
    "title": "Copilot Proxy",
    "properties": {
      "copilotProxy.port": {
        "type": "number",
        "default": 3000,
        "description": "Port for the Express server."
      }
    }
  }
}
```

- **Test Steps:**  
  1. **Settings UI Test:** Open the VS Code Settings UI and verify that the `copilotProxy.port` setting is visible with the correct default value and modifiable.

## Step 6: Update Documentation in readme.md
- **File:** `readme.md`
- **Objective:**  
  Document the new settings feature:
  - Explain the use of the `Copilot Proxy: Configure Port` command.
  - Instruct users on modifying the `copilotProxy.port` setting via the Settings UI.
  - Remind users to restart the server for changes to take effect.

- **Documentation Update Example:**

```
The copilot-proxy extension now allows you to configure the port for the Express server.
- Use the `Copilot Proxy: Configure Port` command to update the port using a simple input box.
- Alternatively, adjust the `copilotProxy.port` setting via the VS Code Settings UI.
Please restart the server if it's currently running to use the new port.
```

- **Test Steps:**  
  1. **Review:** Confirm that the documentation is clear and that a user can follow the instructions to update the port.

## Step 7: Create/Update Unit Tests (Optional)
- **Objective:**  
  Optionally, write unit or integration tests to:
  - Simulate the behavior of `configurePort()` using mocked input from `vscode.window.showInputBox`.
  - Verify that the configuration updates correctly.
  - Ensure that `startServer()` uses the port value from the configuration.

- **Test Steps:**  
  1. **Mocking Test:** Use a testing framework (e.g., Mocha or Jest) to simulate input and assert that configuration update calls are made with the correct value.  
  2. **Port Verification:** Call `startServer()` with a test port and verify through logs or network inspection that the server starts on the specified port.

---

This plan details all the steps required for implementation along with isolated test steps for each change.  
