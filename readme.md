# Copilot Proxy

## Overview

Copilot Proxy is a Visual Studio Code extension that exposes the VS Code Language Model API via an Express server. This experimental extension is intended solely for research and prototyping purposes and should not be used in production environments.

**Disclaimer:**  
This extension is provided as an experiment only. In the past, some users, i.e., cline users, faced bans due to excessive usage. Since Microsoft introduced rate limits to the VS Code LM, no further bans have been reported. Nevertheless, I do not recommend using this extension for anything beyond research and prototyping.

At the moment, the supported LLMs by GitHub Copilot are: "gpt-4o", "gpt-4o-mini", "o1", "o1-mini", "claude-3.5-sonnet", and "o3-mini".

## Features

- **Server Management:** Easily start and stop the Express server from within VS Code.
- **Customizable Port:** Configure the port the server uses through VS Code settings or via an interactive command.
- **Language Model Integration:** Relay chat-based requests and responses with support for both streaming and non-streaming modes.

## Installation

1. **Download the VSIX Package:**
  - Visit the [GitHub Releases](https://github.com/lutzleonhardt/copilot-proxy/releases) page.
  - Download the latest `.vsix` file.

2. **Install the Extension:**
  - Open Visual Studio Code.
  - Go to the Extensions view (`Ctrl+Shift+X` on Windows/Linux or `Cmd+Shift+X` on macOS).
  - Click on the three-dot menu (`...`) and choose **"Install from VSIX..."**.
  - Select the downloaded `.vsix` file.

3. **Reload VS Code:**
  - Accept the prompt to reload the window and activate the extension.

## Configuration

The extension provides a configuration setting to specify the port for the Express server:

- **Setting:** `copilotProxy.port`  
  **Default:** `3000`

You can change this setting in two ways:
- **Via Settings UI:** Open the VS Code Settings (`Ctrl+,` or `Cmd+,`) and search for "Copilot Proxy".
- **Via Command Palette:** Run the command **"Copilot Proxy: Configure Port"** to interactively set the port.

## Using the Extension

### Starting the Server

- Open the Command Palette and run **"Copilot Proxy - Start Server"**.
- The server will start on the configured port (default is `3000`), and a notification will confirm the port.

### Stopping the Server

- Open the Command Palette and run **"Copilot Proxy - Stop Server"** to shut down the server.

### Permission Prompt

On the initial request (e.g., when using Aider or other AI assistants), VS Code will prompt you to grant permission for the extension to interact with the VS Code Language Model API. Please grant permission to ensure proper operation.

## Contributing

Contributions, bug reports, and feature requests are welcome! Please submit issues or pull requests in the [GitHub repository](https://github.com/yourusername/copilot-proxy).

## License

This project is licensed under the MIT License.

